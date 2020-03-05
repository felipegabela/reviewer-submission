import * as Knex from 'knex';
import { v4 as uuid } from 'uuid';
import * as S3 from 'aws-sdk/clients/s3';
import { createKnexAdapter } from '../../knex-table-adapter';
import XpubFileRepository from '../repositories/xpub-file';
import { FileId, FileType, FileStatus } from '../types';
import File from './models/file';
import { SubmissionId } from '../../../domain/submission/types';
import { S3Config } from '../../../config';
import { FileDTO } from '../repositories/types';

export class FileService {
    fileRepository: XpubFileRepository;
    s3: S3;
    bucket: string;

    constructor(knex: Knex<{}, unknown[]>, s3config: S3Config) {
        const adapter = createKnexAdapter(knex, 'public');
        this.fileRepository = new XpubFileRepository(adapter);
        const defaultOptions = {
            accessKeyId: s3config.accessKeyId,
            secretAccessKey: s3config.secretAccessKey,
            apiVersion: '2006-03-01',
            signatureVersion: 'v4',
            s3ForcePathStyle: s3config.s3ForcePathStyle,
        };
        const s3Options = s3config.awsEndPoint ? { ...defaultOptions, endpoint: s3config.awsEndPoint } : defaultOptions;
        this.bucket = s3config.fileBucket;
        this.s3 = new S3(s3Options);
    }

    async create(
        submissionId: SubmissionId,
        filename: string,
        mimeType: string,
        size: number,
        type: FileType,
    ): Promise<File> {
        const id = FileId.fromUuid(uuid());
        const status = FileStatus.CREATED;
        const url = `manuscripts/${submissionId}`;
        const newFile = await this.fileRepository.create({
            id,
            submissionId,
            filename,
            mimeType,
            size,
            type,
            status,
            url,
        });

        return new File(newFile);
    }

    async update(fileDTO: FileDTO): Promise<FileDTO> {
        return this.fileRepository.update(fileDTO);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async upload(fileContents: Buffer, file: File): Promise<any> {
        const { url, id, mimeType } = file;
        return this.s3
            .upload({
                Bucket: this.bucket,
                Key: `${url}/${id}`,
                Body: fileContents.toString(),
                ContentType: mimeType,
                ACL: 'private',
            })
            .promise();
    }
}