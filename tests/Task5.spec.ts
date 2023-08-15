import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, TupleBuilder, TupleReader, toNano } from 'ton-core';
import { Task5 } from '../wrappers/Task5';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task5', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task5');
    });

    let blockchain: Blockchain;
    let task5: SandboxContract<Task5>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task5 = blockchain.openContract(Task5.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task5.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task5.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        let ns: Array<bigint> = [0n, 3n, 4n, 6n, 8n, 265n];
        let ks: Array<bigint> = [5n, 4n, 2n, 4n, 1n, 5n];
        let answers: Array<TupleBuilder> = [
            new TupleBuilder(), 
            new TupleBuilder(),
            new TupleBuilder(),
            new TupleBuilder(),
            new TupleBuilder(),
            new TupleBuilder()
        ];
        answers[0].writeNumber(0);
        answers[0].writeNumber(1);
        answers[0].writeNumber(1);
        answers[0].writeNumber(2);
        answers[0].writeNumber(3);
        
        answers[1].writeNumber(2);
        answers[1].writeNumber(3);
        answers[1].writeNumber(5);
        answers[1].writeNumber(8);

        answers[2].writeNumber(3);
        answers[2].writeNumber(5);

        answers[3].writeNumber(8);
        answers[3].writeNumber(13);
        answers[3].writeNumber(21);
        answers[3].writeNumber(34);

        answers[4].writeNumber(21);
        
        answers[5].writeNumber(10770594215935749279482183257489712959102052723690265265n);
        answers[5].writeNumber(17427187520417066673081023209641459549125606105821258513n);
        answers[5].writeNumber(28197781736352815952563206467131172508227658829511523778n);
        answers[5].writeNumber(45624969256769882625644229676772632057353264935332782291n);
        answers[5].writeNumber(73822750993122698578207436143903804565580923764844306069n);

        let gasUsed = 0n;
        for(let i = 0 ; i < 6 ; i++) {
            const value = await task5.getFib(ns[i], ks[i]);
            // console.log(value.stack.readTuple());
            gasUsed += value.gasUsed !== undefined && value.gasUsed !== null ? value.gasUsed : 0n;
            expect(value.stack.readTuple()).toEqual(new TupleReader(answers[i].build()));
        }
        console.log(gasUsed);
    });
});
