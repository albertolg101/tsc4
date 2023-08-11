import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { BitString, Cell, toNano } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import exp from 'constants';

describe('Task3', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const value = await task3.getFindAndReplace();
        console.log(value.gasUsed);
        let s = value.stack.readCell().asSlice();
        let ans: Array<BitString> = [s.loadBits(s.remainingBits)];
        while(s.remainingRefs) {
            s = s.loadRef().asSlice();
            ans.push(s.loadBits(s.remainingBits));
        }
        console.log(ans);
        expect(true).toEqual(true);
    });
});
