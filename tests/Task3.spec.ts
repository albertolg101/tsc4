import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { BitString, Cell, beginCell, toNano } from 'ton-core';
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
        let linked_list = beginCell()
        .storeUint(0, 1)
        .storeUint(0, 1)
        .storeUint(1, 1)
        .storeUint(1, 1)

        .storeUint(1, 1)
        .storeUint(0, 1)
        .storeUint(1, 1)
        .storeUint(1, 1)

        .storeUint(1, 1)
        .storeRef(
            beginCell()
            .storeUint(0, 1)
            .storeUint(1, 1)
            .storeUint(1, 1)

            .storeRef(
            beginCell()
            .storeUint(0, 1)
            .storeUint(0, 1)
            .storeUint(1, 1)
            .storeUint(1, 1)
            .endCell())

            .endCell())
        .endCell(); // 0011 1011 1011 0011 - 3B3
        //    ANSWER = 0011 1111 1100 11   - 3FCC

        let answer = beginCell().storeUint(0b0011_1111_1100_11, 14).endCell();
        
        let flag = 5;
        let value = 3;

        const ans = await task3.getFindAndReplace(flag, value, linked_list);
        console.log(ans.gasUsed);
        console.log(ans.stack.readCell());
        expect(true).toEqual(true);
    });
});
