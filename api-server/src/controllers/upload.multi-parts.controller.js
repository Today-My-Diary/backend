export class UploadMultiPartsController {
    constructor(uploadMultiPartsBusiness) {
        this.uploadMultiPartsBusiness = uploadMultiPartsBusiness;
    }

    initiateMultiPartsUpload = async (req, res) => {
        const { uploadDate } = req.body;
        const result = await this.uploadMultiPartsBusiness.initiateMultiPartsUpload(
            req.user.userId,
            uploadDate
        );
        res.status(200).json(result);
    };

    getUploadMultiPartsUrl = async (req, res) => {
        const { uploadId, partNumber, uploadDate } = req.body;
        const presignedUrl = await this.uploadMultiPartsBusiness.getUploadMultiPartsUrl(
            req.user.userId,
            uploadId,
            partNumber,
            uploadDate
        );
        res.status(200).json({ presignedUrl });
    };

    completeMultiPartsUpload = async (req, res) => {
        const { uploadId, parts, uploadDate, timestamps } = req.body;
        const result = await this.uploadMultiPartsBusiness.completeMultiPartsUpload(
            req.user.userId,
            uploadId,
            parts,
            uploadDate,
            timestamps
        );
        res.status(200).json(result);
    };
}
