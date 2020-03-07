import File from '../models/File';

class FileController {
    async store(req, res) {
        const { originalname: name, filename: path } = req.file;
        const { signature } = req.body;

        console.log(signature);
        const file = await File.create({
            name,
            path,
            signature,
        });

        return res.json(file);
    }
}

export default new FileController();
