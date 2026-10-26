import { and, asc, desc, eq, max } from "drizzle-orm";
import { portfolioPhotos, portfolioProjects } from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  adminPhotoSrc,
  publicPhotoSrc,
  type PortfolioPhotoAdmin,
  type PortfolioProjectAdmin,
  type PortfolioProjectPublic,
} from "@/lib/portfolio";

export type {
  PortfolioPhotoAdmin,
  PortfolioPhotoPublic,
  PortfolioProjectAdmin,
  PortfolioProjectPublic,
} from "@/lib/portfolio";

export async function listProjectsAdmin(): Promise<PortfolioProjectAdmin[]> {
  const db = getDb();
  const projects = await db
    .select()
    .from(portfolioProjects)
    .orderBy(asc(portfolioProjects.sortOrder), desc(portfolioProjects.updatedAt));
  const photos = await db
    .select({
      id: portfolioPhotos.id,
      projectId: portfolioPhotos.projectId,
      sortOrder: portfolioPhotos.sortOrder,
    })
    .from(portfolioPhotos)
    .orderBy(asc(portfolioPhotos.sortOrder), asc(portfolioPhotos.createdAt));

  return projects.map((project) => {
    const projectPhotos = photos.filter((photo) => photo.projectId === project.id);
    const cover = projectPhotos[0];
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      published: project.published,
      sortOrder: project.sortOrder,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      photoCount: projectPhotos.length,
      coverSrc: cover ? adminPhotoSrc(cover.id) : null,
    };
  });
}

export async function getProjectAdmin(id: string) {
  const db = getDb();
  const [project] = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.id, id));
  if (!project) {
    return null;
  }
  const photos = await db
    .select({
      id: portfolioPhotos.id,
      caption: portfolioPhotos.caption,
      mediaType: portfolioPhotos.mediaType,
      sortOrder: portfolioPhotos.sortOrder,
      createdAt: portfolioPhotos.createdAt,
    })
    .from(portfolioPhotos)
    .where(eq(portfolioPhotos.projectId, id))
    .orderBy(asc(portfolioPhotos.sortOrder), asc(portfolioPhotos.createdAt));

  return {
    ...project,
    photos: photos.map((photo) => ({
      ...photo,
      src: adminPhotoSrc(photo.id),
    })) satisfies PortfolioPhotoAdmin[],
  };
}

export async function createProject(title = "New project") {
  const db = getDb();
  const [row] = await db
    .select({ value: max(portfolioProjects.sortOrder) })
    .from(portfolioProjects);
  const sortOrder = (row?.value ?? -1) + 1;
  const [project] = await db
    .insert(portfolioProjects)
    .values({ title, sortOrder })
    .returning();
  return project;
}

export async function updateProject(
  id: string,
  patch: {
    title?: string;
    description?: string;
    published?: boolean;
    sortOrder?: number;
  }
) {
  const [project] = await getDb()
    .update(portfolioProjects)
    .set({
      ...patch,
      updatedAt: new Date(),
    })
    .where(eq(portfolioProjects.id, id))
    .returning();
  return project ?? null;
}

export async function deleteProject(id: string) {
  await getDb().delete(portfolioProjects).where(eq(portfolioProjects.id, id));
}

export async function addPhoto(
  projectId: string,
  input: { caption?: string; mediaType: string; data: string }
) {
  const db = getDb();
  const [row] = await db
    .select({ value: max(portfolioPhotos.sortOrder) })
    .from(portfolioPhotos)
    .where(eq(portfolioPhotos.projectId, projectId));
  const sortOrder = (row?.value ?? -1) + 1;
  const [photo] = await db
    .insert(portfolioPhotos)
    .values({
      projectId,
      caption: input.caption ?? "",
      mediaType: input.mediaType,
      data: input.data,
      sortOrder,
    })
    .returning({
      id: portfolioPhotos.id,
      caption: portfolioPhotos.caption,
      mediaType: portfolioPhotos.mediaType,
      sortOrder: portfolioPhotos.sortOrder,
      createdAt: portfolioPhotos.createdAt,
    });
  await db
    .update(portfolioProjects)
    .set({ updatedAt: new Date() })
    .where(eq(portfolioProjects.id, projectId));
  return {
    ...photo,
    src: adminPhotoSrc(photo.id),
  };
}

export async function updatePhoto(
  id: string,
  patch: { caption?: string; sortOrder?: number }
) {
  const [photo] = await getDb()
    .update(portfolioPhotos)
    .set(patch)
    .where(eq(portfolioPhotos.id, id))
    .returning({
      id: portfolioPhotos.id,
      projectId: portfolioPhotos.projectId,
      caption: portfolioPhotos.caption,
      mediaType: portfolioPhotos.mediaType,
      sortOrder: portfolioPhotos.sortOrder,
      createdAt: portfolioPhotos.createdAt,
    });
  if (!photo) {
    return null;
  }
  await getDb()
    .update(portfolioProjects)
    .set({ updatedAt: new Date() })
    .where(eq(portfolioProjects.id, photo.projectId));
  return {
    id: photo.id,
    caption: photo.caption,
    mediaType: photo.mediaType,
    sortOrder: photo.sortOrder,
    createdAt: photo.createdAt,
    src: adminPhotoSrc(photo.id),
  };
}

export async function deletePhoto(id: string) {
  const [photo] = await getDb()
    .delete(portfolioPhotos)
    .where(eq(portfolioPhotos.id, id))
    .returning({ projectId: portfolioPhotos.projectId });
  if (photo) {
    await getDb()
      .update(portfolioProjects)
      .set({ updatedAt: new Date() })
      .where(eq(portfolioProjects.id, photo.projectId));
  }
}

export async function getPublishedPhotoData(id: string) {
  const [row] = await getDb()
    .select({
      data: portfolioPhotos.data,
      mediaType: portfolioPhotos.mediaType,
      published: portfolioProjects.published,
    })
    .from(portfolioPhotos)
    .innerJoin(
      portfolioProjects,
      eq(portfolioPhotos.projectId, portfolioProjects.id)
    )
    .where(and(eq(portfolioPhotos.id, id), eq(portfolioProjects.published, true)));
  return row ?? null;
}

/** Admin preview: any photo by id (auth required at route). */
export async function getPhotoData(id: string) {
  const [row] = await getDb()
    .select({
      data: portfolioPhotos.data,
      mediaType: portfolioPhotos.mediaType,
    })
    .from(portfolioPhotos)
    .where(eq(portfolioPhotos.id, id));
  return row ?? null;
}

export async function listPublishedProjectsWithPhotos(): Promise<
  PortfolioProjectPublic[]
> {
  const db = getDb();
  const projects = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.published, true))
    .orderBy(asc(portfolioProjects.sortOrder), desc(portfolioProjects.updatedAt));
  if (!projects.length) {
    return [];
  }

  const photos = await db
    .select({
      id: portfolioPhotos.id,
      projectId: portfolioPhotos.projectId,
      caption: portfolioPhotos.caption,
      sortOrder: portfolioPhotos.sortOrder,
    })
    .from(portfolioPhotos)
    .innerJoin(
      portfolioProjects,
      eq(portfolioPhotos.projectId, portfolioProjects.id)
    )
    .where(eq(portfolioProjects.published, true))
    .orderBy(asc(portfolioPhotos.sortOrder), asc(portfolioPhotos.createdAt));

  return projects
    .map((project) => {
      const projectPhotos = photos
        .filter((photo) => photo.projectId === project.id)
        .map((photo) => ({
          id: photo.id,
          caption: photo.caption,
          src: publicPhotoSrc(photo.id),
        }));
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        coverSrc: projectPhotos[0]?.src ?? null,
        photos: projectPhotos,
      };
    })
    .filter((project) => project.photos.length > 0);
}
