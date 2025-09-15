import express from 'express';
import { createNhanVien, getAllNhanVien, getNhanVienById, 
    getNhanVienByMaNV, getNhanVienByName, getNhanVienByDiaChi, 
    getNhanVienBySoDienThoai, updateNhanVien, deleteNhanVien } from '../controllers/nhanVienController.js';

const nhanVienRouter = express.Router();

nhanVienRouter.post('/create', createNhanVien);
nhanVienRouter.get('/', getAllNhanVien);
nhanVienRouter.post('/getByID', getNhanVienById);
nhanVienRouter.post('/getByMaNV', getNhanVienByMaNV);
nhanVienRouter.post('/getByName', getNhanVienByName);
nhanVienRouter.post('/getByDiaChi', getNhanVienByDiaChi);
nhanVienRouter.post('/getBySoDienThoai', getNhanVienBySoDienThoai);
nhanVienRouter.put('/:id', updateNhanVien);
nhanVienRouter.delete('/delete', deleteNhanVien);

export default nhanVienRouter;