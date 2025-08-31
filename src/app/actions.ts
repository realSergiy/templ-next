'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db, features, lanes, publishedRoadmap } from '@/lib/db';
import {
  createFeatureSchema,
  updateFeatureSchema,
  deleteFeatureSchema,
  type CreateFeatureInput,
  type UpdateFeatureInput,
  type DeleteFeatureInput,
} from '@/lib/validation';
import { eq, and, or, gte, lte, not } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

const validateOverlap = async (
  laneId: string,
  startQuarter: number,
  endQuarter: number,
  excludeId?: string,
) => {
  const overlappingFeatures = await db
    .select()
    .from(features)
    .where(
      and(
        eq(features.laneId, laneId),
        eq(features.status, 'draft'),
        excludeId ? not(eq(features.id, excludeId)) : undefined,
        or(
          and(gte(features.startQuarter, startQuarter), lte(features.startQuarter, endQuarter)),
          and(gte(features.endQuarter, startQuarter), lte(features.endQuarter, endQuarter)),
          and(lte(features.startQuarter, startQuarter), gte(features.endQuarter, endQuarter)),
        ),
      ),
    );

  return overlappingFeatures.length > 0;
};

export const createFeature = async (input: CreateFeatureInput) => {
  try {
    const validated = createFeatureSchema.parse(input);

    if (validated.startQuarter > validated.endQuarter) {
      return { success: false, error: 'Start quarter must be before or equal to end quarter' };
    }

    const hasOverlap = await validateOverlap(
      validated.laneId,
      validated.startQuarter,
      validated.endQuarter,
    );

    if (hasOverlap) {
      return { success: false, error: 'Feature overlaps with existing features in this lane' };
    }

    const id = randomUUID();
    await db.insert(features).values({
      id,
      ...validated,
      status: 'draft',
    });

    revalidatePath('/');
    return { success: true, id };
  } catch (e) {
    console.error('Error creating feature:', e);
    return { success: false, error: 'Failed to create feature' };
  }
};

export const updateFeature = async (input: UpdateFeatureInput) => {
  try {
    const validated = updateFeatureSchema.parse(input);

    const existing = await db.select().from(features).where(eq(features.id, validated.id)).limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Feature not found' };
    }

    const feature = existing[0];
    if (!feature) {
      return { success: false, error: 'Feature not found' };
    }
    const startQuarter = validated.startQuarter ?? feature.startQuarter;
    const endQuarter = validated.endQuarter ?? feature.endQuarter;
    const laneId = validated.laneId ?? feature.laneId;

    if (startQuarter > endQuarter) {
      return { success: false, error: 'Start quarter must be before or equal to end quarter' };
    }

    const hasOverlap = await validateOverlap(laneId, startQuarter, endQuarter, validated.id);

    if (hasOverlap) {
      return { success: false, error: 'Feature overlaps with existing features in this lane' };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.laneId !== undefined) updateData.laneId = validated.laneId;
    if (validated.startQuarter !== undefined) updateData.startQuarter = validated.startQuarter;
    if (validated.endQuarter !== undefined) updateData.endQuarter = validated.endQuarter;
    if (validated.linkUrl !== undefined) updateData.linkUrl = validated.linkUrl;
    if (validated.color !== undefined) updateData.color = validated.color;

    await db.update(features).set(updateData).where(eq(features.id, validated.id));

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Error updating feature:', e);
    return { success: false, error: 'Failed to update feature' };
  }
};

export const deleteFeature = async (input: DeleteFeatureInput) => {
  try {
    const validated = deleteFeatureSchema.parse(input);

    await db
      .delete(features)
      .where(and(eq(features.id, validated.id), eq(features.status, 'draft')));

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Error deleting feature:', e);
    return { success: false, error: 'Failed to delete feature' };
  }
};

export const publishRoadmap = async () => {
  try {
    const [draftFeatures, allLanes] = await Promise.all([
      db.select().from(features).where(eq(features.status, 'draft')),
      db.select().from(lanes),
    ]);

    const publishedData = {
      features: draftFeatures,
      lanes: allLanes,
      publishedAt: new Date().toISOString(),
    };

    await db.transaction(async tx => {
      await tx.update(features).set({ status: 'published' }).where(eq(features.status, 'draft'));

      await tx.insert(publishedRoadmap).values({
        id: randomUUID(),
        data: JSON.stringify(publishedData),
      });
    });

    revalidateTag('roadmap:published');
    revalidatePath('/public');

    return { success: true };
  } catch (e) {
    console.error('Error publishing roadmap:', e);
    return { success: false, error: 'Failed to publish roadmap' };
  }
};
