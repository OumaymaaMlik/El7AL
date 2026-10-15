import type { FastifyInstance } from 'fastify';
import { uploadFileToMinIO } from '../../services/storage.service.js';
import { authenticate } from '../../utils/authGuards.js';
import { detectFile } from '../../utils/fileSignature.js';
import { messageOf } from '../../utils/respond.js';

const IMAGES = ['image/jpeg', 'image/png', 'image/webp'];

/** What each kind of upload accepts, and the folder it is stored in. */
const UPLOADS = [
  {
    path: '/document',
    folder: 'documents',
    accepts: [...IMAGES, 'application/pdf'],
    summary: 'Identity card or certificate of an artisan',
  },
  { path: '/receipt', folder: 'receipts', accepts: [...IMAGES, 'application/pdf'], summary: 'Bank transfer receipt' },
  { path: '/avatar', folder: 'avatars', accepts: IMAGES, summary: 'Profile photo' },
] as const;

export async function uploadRoutes(app: FastifyInstance) {
  for (const upload of UPLOADS) {
    app.post(
      upload.path,
      {
        config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
        schema: { tags: ['File Uploads'], summary: `Upload: ${upload.summary}`, security: [{ bearerAuth: [] }] },
        onRequest: [authenticate],
      },
      async (request, reply) => {
        const data = await request.file();
        if (!data) return reply.code(400).send({ success: false, error: 'No file uploaded' });
        if (!(upload.accepts as readonly string[]).includes(data.mimetype)) {
          return reply.code(400).send({ success: false, error: 'Format de fichier non accepté.' });
        }
        let buffer: Buffer;
        try {
          buffer = await data.toBuffer();
        } catch (err) {
          // Typically a file over the size limit.
          return reply.code(400).send({ success: false, error: messageOf(err) });
        }
        // The content decides, not the declared type or the file name.
        const detected = detectFile(buffer);
        if (!detected || !(upload.accepts as readonly string[]).includes(detected.mime)) {
          return reply.code(400).send({ success: false, error: 'Format de fichier non accepté.' });
        }
        try {
          const url = await uploadFileToMinIO(buffer, `file${detected.ext}`, upload.folder, detected.mime);
          return reply.code(201).send({ success: true, url });
        } catch (err) {
          return reply.code(400).send({ success: false, error: messageOf(err) });
        }
      },
    );
  }
}
