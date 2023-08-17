import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task1 = blockchain.openContract(Task1.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        let tree =  beginCell()
                        .storeUint(1, 16)
                        .storeRef(beginCell()
                            .storeUint(2, 16)
                        .endCell())
                        .storeRef(beginCell()
                            .storeUint(3, 16)
                            .storeRef(beginCell()
                                .storeUint(4, 16)
                            .endCell())
                            .storeRef(beginCell()
                                .storeUint(5, 16)
                            .endCell())
                        .endCell())
                    .endCell();
        
        let hash: bigint = 101915301360898219708539241468632138772078984425773115946424364477664673047224n;
        let value = await task1.getFindBranchByHash(hash, tree);
        console.log(value.stack.readCell());
    });
});
