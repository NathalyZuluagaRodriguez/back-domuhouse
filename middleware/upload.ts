// config/upload.ts
import multer from 'multer';
import path from 'path';

// Configuración de multer para subir archivos
const upload = multer({
  dest: 'uploads/',
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB por imagen
    files: 10 // Máximo 10 archivos
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
  }
});

export default upload;