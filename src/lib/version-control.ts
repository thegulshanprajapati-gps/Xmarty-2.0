import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface CourseVersion {
  course_id: string;
  version: number;
  data: any;
  created_at: Date;
  created_by: string;
  commit_message: string;
}

export async function saveCourseVersion(
  courseId: string,
  data: any,
  createdBy: string,
  commitMessage: string
) {
  try {
    const db = await getDb();
    const collection = db.collection('course_versions');

    const lastVersionDoc = await collection.findOne(
      { course_id: courseId },
      { sort: { version: -1 } }
    );

    const nextVersion = lastVersionDoc ? lastVersionDoc.version + 1 : 1;

    const newVersion: CourseVersion = {
      course_id: courseId,
      version: nextVersion,
      data,
      created_at: new Date(),
      created_by: createdBy,
      commit_message: commitMessage
    };

    await collection.insertOne(newVersion);
    return nextVersion;
  } catch (error) {
    console.error('Failed to save course version:', error);
    return null;
  }
}

export async function getCourseVersions(courseId: string) {
  try {
    const db = await getDb();
    return await db.collection('course_versions')
      .find({ course_id: courseId })
      .sort({ version: -1 })
      .toArray();
  } catch (error) {
    console.error('Failed to get course versions:', error);
    return [];
  }
}

export async function restoreCourseVersion(courseId: string, version: number) {
  try {
    const db = await getDb();
    const versionDoc = await db.collection('course_versions').findOne({
      course_id: courseId,
      version
    });

    if (!versionDoc) return false;

    await db.collection('courses').updateOne(
      { _id: new ObjectId(courseId) },
      { $set: versionDoc.data }
    );

    return true;
  } catch (error) {
    console.error('Failed to restore course version:', error);
    return false;
  }
}
