import * as Knex from 'knex';
import { SubmissionId } from '../types';
import XpubSubmissionRootRepository from '../repositories/xpub-submission-root';
import uuid = require('uuid');
import Submission from './models/submission';
import { SubmissionDTO } from '../repositories/types';

export class SubmissionService {
    submissionRepository: XpubSubmissionRootRepository;

    constructor(knexConnection: Knex<{}, unknown[]>) {
        this.submissionRepository = new XpubSubmissionRootRepository(knexConnection);
    }

    async findAll(): Promise<Submission[]> {
        const submissions = await this.submissionRepository.findAll();
        return submissions.map((dto: SubmissionDTO) => new Submission(dto));
    }

    async create(articleType: string, userId: string): Promise<Submission> {
        const id = SubmissionId.fromUuid(uuid());
        const submission = new Submission({
            id,
            title: '',
            updated: new Date(),
            articleType,
            status: 'INITIAL',
            createdBy: userId,
        });
        // this works because Submission interface == SubmissionDTO interface. In future we will probably ned a toDto on the submission or some mapper class
        const savedSubmissionDTO = await this.submissionRepository.create(submission);

        return new Submission(savedSubmissionDTO);
    }

    async getSubmission(id: SubmissionId): Promise<Submission> {
        const submissionDTO = await this.submissionRepository.findById(id);
        if (!submissionDTO) {
            throw new Error('Unable to find submission with id: ' + id);
        }
        return new Submission(submissionDTO);
    }

    async changeTitle(id: SubmissionId, title: string): Promise<Submission> {
        const result = await this.submissionRepository.findById(id);
        if (result === null) {
            throw new Error('Unable to find submission with id: ' + id);
        }
        const submission = new Submission(result);
        submission.title = title;
        const submissionDTO = await this.submissionRepository.update(submission);
        return new Submission(submissionDTO);
    }

    async deleteSubmission(id: SubmissionId): Promise<boolean> {
        return await this.submissionRepository.delete(id);
    }
}
