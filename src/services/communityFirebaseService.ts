import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
} from 'firebase/storage';
import { db, storage, auth, ensureFirebaseAuth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';

export interface FirebasePost {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  authorLevel?: number;
  text: string;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  gameTag?: string;
  category?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseComment {
  id: string;
  userId: string;
  authorName?: string;
  authorAvatar?: string;
  text: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Subscribe in real-time to posts collection in Firestore
 */
export function subscribeToRealPosts(
  onPosts: (posts: FirebasePost[]) => void,
  onError?: (error: Error) => void
): () => void {
  const postsCollection = collection(db, 'posts');

  try {
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts: FirebasePost[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Operative',
            authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.authorId || d.id}`,
            authorRole: data.authorRole || 'MEMBER',
            authorLevel: data.authorLevel || 1,
            text: data.text || '',
            mediaUrl: data.mediaUrl || null,
            mediaType: data.mediaType || null,
            gameTag: data.gameTag || 'General',
            category: data.category || 'General',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        onPosts(posts);
      },
      (err) => {
        console.warn('Ordered posts query error, falling back to simple query:', err);
        // Fallback to unordered query in case index is pending
        const fallbackSub = onSnapshot(
          postsCollection,
          (snap) => {
            const posts: FirebasePost[] = snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                authorId: data.authorId || '',
                authorName: data.authorName || 'Operative',
                authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.authorId || d.id}`,
                authorRole: data.authorRole || 'MEMBER',
                authorLevel: data.authorLevel || 1,
                text: data.text || '',
                mediaUrl: data.mediaUrl || null,
                mediaType: data.mediaType || null,
                gameTag: data.gameTag || 'General',
                category: data.category || 'General',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              };
            });
            // Client-side sort by timestamp
            posts.sort((a, b) => {
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return timeB - timeA;
            });
            onPosts(posts);
          },
          (fallbackErr) => {
            console.error('Failed to load posts from Firestore:', fallbackErr);
            if (onError) onError(fallbackErr);
          }
        );
        return () => fallbackSub();
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.error('Error initiating posts listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Upload media to Firebase Storage and create post in Firestore
 */
export async function createRealPost(params: {
  text: string;
  mediaFile?: File | null;
  mediaType?: 'image' | 'video' | null;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  authorLevel?: number;
  gameTag?: string;
  category?: string;
  onProgress?: (percent: number) => void;
  onUploadTask?: (task: UploadTask) => void;
}): Promise<string> {
  await ensureFirebaseAuth();
  const currentUser = auth.currentUser;
  const authorId = params.authorId || currentUser?.uid;

  if (!authorId) {
    throw new Error('User must be authenticated to publish a post.');
  }

  let downloadUrl: string | null = null;
  let resolvedMediaType: 'image' | 'video' | null = params.mediaType || null;

  // Real upload to Firebase Storage if mediaFile provided
  if (params.mediaFile) {
    const file = params.mediaFile;
    if (!resolvedMediaType) {
      resolvedMediaType = file.type.startsWith('video/') ? 'video' : 'image';
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `posts/${Date.now()}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        authorId,
        uploadedAt: new Date().toISOString(),
      },
    });

    if (params.onUploadTask) {
      params.onUploadTask(uploadTask);
    }

    // Await upload with real progress tracking
    downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (params.onProgress) params.onProgress(percent);
          }
        },
        (error) => {
          console.error('Firebase Storage upload failed:', error);
          reject(new Error(`Media upload failed: ${error.message}`));
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            if (params.onProgress) params.onProgress(100);
            resolve(url);
          } catch (urlErr: any) {
            reject(new Error(`Failed to retrieve media URL: ${urlErr.message}`));
          }
        }
      );
    });
  }

  // Create document in Firestore: posts/{postId}
  try {
    const postData = {
      authorId,
      authorName: params.authorName || currentUser?.displayName || 'Gamer',
      authorAvatar: params.authorAvatar || currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${authorId}`,
      authorRole: params.authorRole || 'OPERATIVE',
      authorLevel: params.authorLevel || 1,
      text: params.text.trim(),
      mediaUrl: downloadUrl,
      mediaType: downloadUrl ? resolvedMediaType : null,
      gameTag: params.gameTag || 'Cyber Strike',
      category: params.category || 'General',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts');
  }
}

/**
 * Delete a post from Firestore
 */
export async function deleteRealPost(postId: string): Promise<void> {
  await ensureFirebaseAuth();
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
}

/**
 * Real-time listener for likes on a post: posts/{postId}/likes
 */
export function subscribeToPostLikes(
  postId: string,
  onLikesChange: (likedUserIds: string[]) => void
): () => void {
  const likesCol = collection(db, 'posts', postId, 'likes');
  const unsubscribe = onSnapshot(
    likesCol,
    (snapshot) => {
      const userIds = snapshot.docs.map((d) => d.id);
      onLikesChange(userIds);
    },
    (err) => {
      console.warn(`Error listening to likes on post ${postId}:`, err);
    }
  );
  return unsubscribe;
}

/**
 * Toggle real like in Firestore: posts/{postId}/likes/{userId}
 * Click Like -> create document
 * Click again -> remove it
 */
export async function toggleRealLike(
  postId: string,
  userId: string,
  isCurrentlyLiked: boolean
): Promise<boolean> {
  await ensureFirebaseAuth();
  const likeDocRef = doc(db, 'posts', postId, 'likes', userId);

  try {
    if (isCurrentlyLiked) {
      await deleteDoc(likeDocRef);
      return false;
    } else {
      await setDoc(likeDocRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      return true;
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isCurrentlyLiked ? OperationType.DELETE : OperationType.CREATE,
      `posts/${postId}/likes/${userId}`
    );
  }
}

/**
 * Real-time listener for comments on a post: posts/{postId}/comments
 */
export function subscribeToPostComments(
  postId: string,
  onCommentsChange: (comments: FirebaseComment[]) => void
): () => void {
  const commentsCol = collection(db, 'posts', postId, 'comments');

  try {
    const q = query(commentsCol, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comments: FirebaseComment[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId || '',
            authorName: data.authorName || 'Operative',
            authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.userId || d.id}`,
            text: data.text || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        onCommentsChange(comments);
      },
      (err) => {
        // Fallback to simple query if orderBy index is not ready
        console.warn(`Comments ordered listener error for post ${postId}, using fallback:`, err);
        const fallback = onSnapshot(commentsCol, (snap) => {
          const comments: FirebaseComment[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId || '',
              authorName: data.authorName || 'Operative',
              authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.userId || d.id}`,
              text: data.text || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          });
          comments.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeA - timeB;
          });
          onCommentsChange(comments);
        });
        return () => fallback();
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error(`Error subscribing to comments for post ${postId}:`, err);
    return () => {};
  }
}

/**
 * Add a comment to Firestore: posts/{postId}/comments/{commentId}
 * Fields: userId, text, createdAt, updatedAt
 */
export async function addRealComment(
  postId: string,
  text: string,
  user: {
    uid: string;
    displayName?: string;
    avatarUrl?: string;
  }
): Promise<string> {
  await ensureFirebaseAuth();
  if (!user.uid) {
    throw new Error('User must be authenticated to add a comment.');
  }

  const commentData = {
    userId: user.uid,
    authorName: user.displayName || 'Gamer',
    authorAvatar: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
    text: text.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const commentsCol = collection(db, 'posts', postId, 'comments');
    const docRef = await addDoc(commentsCol, commentData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
  }
}

/**
 * Delete user's own comment: posts/{postId}/comments/{commentId}
 */
export async function deleteRealComment(
  postId: string,
  commentId: string
): Promise<void> {
  await ensureFirebaseAuth();
  try {
    const commentDocRef = doc(db, 'posts', postId, 'comments', commentId);
    await deleteDoc(commentDocRef);
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `posts/${postId}/comments/${commentId}`
    );
  }
}
