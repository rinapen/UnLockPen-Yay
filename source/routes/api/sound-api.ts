import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const AUDIO_UPLOAD_DIR = path.join(__dirname, '../../../uploads/audio');
const AUDIO_FILES_DB = path.join(AUDIO_UPLOAD_DIR, 'audio_files.json');

// 存在しない場合は作成
if (!fs.existsSync(AUDIO_UPLOAD_DIR)) {
  fs.mkdirSync(AUDIO_UPLOAD_DIR, { recursive: true });
}

// ファイル情報を保存するJSONファイルの初期化
if (!fs.existsSync(AUDIO_FILES_DB)) {
  fs.writeFileSync(AUDIO_FILES_DB, JSON.stringify([]));
}

// ファイルサイズ制限なし
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AUDIO_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // ユニークネーム
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('=== ファイルフィルター処理開始 ===');
    console.log('File name:', file.originalname);
    console.log('File mimetype:', file.mimetype);
    console.log('File size:', file.size);
    
    // 音声ファイルのみ許可
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/aac',
      'audio/flac',
      'audio/webm',
      'audio/x-m4a',
      'audio/x-wav',
      'audio/x-aiff',
      'audio/x-pn-realaudio',
      'audio/x-realaudio',
      'audio/x-ms-wma',
      'audio/x-ms-wax',
      'audio/x-ms-wmv',
      'audio/x-ms-asf',
      'audio/x-ms-asx',
      'audio/x-ms-wvx',
      'audio/x-ms-wm',
      'audio/x-ms-wmx',
      'audio/x-ms-wmz',
      'audio/x-ms-wmd',
      'audio/x-ms-wmp',
      'audio/x-ms-wml',
      'audio/x-ms-wmc',
      'audio/x-ms-wmv',
      'audio/x-ms-wma',
      'audio/x-ms-wax',
      'audio/x-ms-wvx',
      'audio/x-ms-wmx',
      'audio/x-ms-wmz',
      'audio/x-ms-wmd',
      'audio/x-ms-wmp',
      'audio/x-ms-wml',
      'audio/x-ms-wmc'
    ];
    
    const allowedExtensions = [
      '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm',
      '.wma', '.wmv', '.asf', '.asx', '.wvx', '.wm', '.wmx',
      '.wmz', '.wmd', '.wmp', '.wml', '.wmc'
    ];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log('File extension:', fileExtension);
    
    const isMimeTypeAllowed = allowedMimes.includes(file.mimetype);
      // ファイル拡張子チェック
    const isExtensionAllowed = allowedExtensions.includes(fileExtension);
    
    console.log('MIME type allowed:', isMimeTypeAllowed);
    console.log('Extension allowed:', isExtensionAllowed);
    
    if (isMimeTypeAllowed || isExtensionAllowed) {
      console.log('File accepted');
      cb(null, true);
    } else {
      console.log('File rejected - not an audio file');
      cb(new Error('音声ファイルのみアップロード可能です'));
    }
    
    console.log('=== ファイルフィルター処理完了 ===');
  }
});

// 読み込む関数
function loadAudioFiles(): any[] {
  try {
    const data = fs.readFileSync(AUDIO_FILES_DB, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load audio files:', error);
    return [];
  }
}

// 保存する関数
function saveAudioFiles(audioFiles: any[]): void {
  try {
    fs.writeFileSync(AUDIO_FILES_DB, JSON.stringify(audioFiles, null, 2));
  } catch (error) {
    console.error('Failed to save audio files:', error);
  }
}

// リスト取得API
router.get('/list', (req: Request, res: Response): void => {
  try {
    const audioFiles = loadAudioFiles();
    res.json({
      success: true,
      audioFiles: audioFiles
    });
  } catch (error) {
    console.error('Failed to get audio files list:', error);
    res.status(500).json({
      success: false,
      message: '音声ファイル一覧の取得に失敗しました'
    });
  }
});

// アップロードAPI
router.post('/upload', upload.single('audioFile'), (req: Request, res: Response): void => {
  console.log('=== アップロード処理開始 ===');
  
  try {
    if (!req.file) {
      console.log('No file uploaded');
      res.status(400).json({
        success: false,
        message: 'ファイルが選択されていません'
      });
      return;
    }

    const fileName = req.body.fileName;
    if (!fileName) {
      console.log('No fileName provided');
      res.status(400).json({
        success: false,
        message: 'ファイル名が指定されていません'
      });
      return;
    }

    console.log('Processing file:', fileName);
    const audioFiles = loadAudioFiles();
    
    // 既存チェック
    const existingFile = audioFiles.find(file => file.name === fileName);
    if (existingFile) {
      console.log('File with same name already exists:', fileName);
      res.status(400).json({
        success: false,
        message: '同じ名前のファイルが既に存在します'
      });
      return;
    }

    // 新しいファイル情報を作成
    const newAudioFile = {
      id: uuidv4(),
      name: fileName,
      path: `/uploads/audio/${req.file.filename}`,
      originalName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      fileSize: req.file.size
    };

    console.log('Created new audio file object:', newAudioFile);
    audioFiles.push(newAudioFile);
    saveAudioFiles(audioFiles);

    console.log('File saved successfully');
    res.json({
      success: true,
      message: 'アップロード完了',
      audioFile: newAudioFile
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: `アップロードエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
    });
  }
  
  console.log('=== アップロード処理完了 ===');
});

// ファイル削除API
router.delete('/delete/:id', (req: Request, res: Response): void => {
  try {
    const audioFileId = req.params.id;
    const audioFiles = loadAudioFiles();
    
    const audioFileIndex = audioFiles.findIndex(file => file.id === audioFileId);
    if (audioFileIndex === -1) {
      res.status(404).json({
        success: false,
        message: '音声ファイルが見つかりません'
      });
      return;
    }

    const audioFile = audioFiles[audioFileIndex];
    const filePath = path.join(__dirname, '../../../', audioFile.path);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    audioFiles.splice(audioFileIndex, 1);
    saveAudioFiles(audioFiles);

    res.json({
      success: true,
      message: '音声ファイルが削除されました'
    });
  } catch (error) {
    console.error('Failed to delete audio file:', error);
    res.status(500).json({
      success: false,
      message: '音声ファイルの削除に失敗しました'
    });
  }
});

// 音声ファイル配信（静的ファイルとして提供）
router.get('/uploads/audio/:filename', (req: Request, res: Response): void => {
  const filename = req.params.filename;
  const filePath = path.join(AUDIO_UPLOAD_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'ファイルが見つかりません'
    });
  }
});

export default router;