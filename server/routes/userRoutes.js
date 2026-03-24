import express from 'express';
import multer from 'multer';
import { createUser, getUsers, deleteUser, updateProfileImage } from '../controllers/userController.js';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format not supported'));
  }
});

router.post('/', createUser);
router.get('/', getUsers);
router.delete('/:id', deleteUser);
router.post('/:id/profile-image', upload.single('image'), updateProfileImage);

export default router;
