// This should probably be called something else
import { SubmissionRepository, ISubmission, SubmissionId } from '../../packages/submission/submission.repository';
import { Option } from 'funfix';
import * as Knex from 'knex';

export class KnexSubmissionRepository implements SubmissionRepository {
    private readonly TABLE_NAME = 'submission';

    public constructor(private readonly knex: Knex<{}, unknown[]>) {}

    public async initSchema(): Promise<boolean | void> {
        // TODO: Add a method for handling when the table does/doesn't exist
        // as this will error if the table already exists
        // XXX: Maybe move this to migrations
        const hasTable = await this.knex.schema.hasTable(this.TABLE_NAME);

        if (hasTable) {
            return hasTable;
        }

        return await this.knex.schema.createTable(this.TABLE_NAME, (table: Knex.CreateTableBuilder) => {
            table.uuid('id');
            table.string('title');
            table.timestamp('updated').defaultTo(this.knex.fn.now());
        });
    }

    close(): void {
        this.knex.destroy();
    }

    public async findAll(): Promise<ISubmission[]> {
        const stuff = await this.knex(this.TABLE_NAME).select<ISubmission[]>('id', 'title', 'updated');

        const dated = stuff.map(s => ({ ...s, updated: new Date(s.updated) }));
        return dated;
    }

    public async findById(id: SubmissionId): Promise<Option<ISubmission>> {
        const rows = await this.knex(this.TABLE_NAME)
            .where({ id })
            .select<ISubmission[]>('id', 'title', 'updated');

        return Option.of(rows[0]);
    }

    public async save(subm: ISubmission): Promise<ISubmission> {
        // Should this use the Submission entity?
        const toInsert = { ...subm, updated: new Date() };

        await this.knex(this.TABLE_NAME).insert(toInsert);
        return toInsert;
    }

    public async delete(id: SubmissionId): Promise<boolean> {
        const res = await this.knex(this.TABLE_NAME)
            .where({ id })
            .delete();

        // NOTE: Maybe this should error if it can't delete anything? e.g. res === 0?
        if (res > 1) {
            throw new Error('Error: deleted too much!');
        }

        return res === 1;
    }
}
