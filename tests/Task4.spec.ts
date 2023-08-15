import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        let shift: Array<bigint> = [1n, 2n, 26n, 27n, 28n, -1n, -2n, -26n, -27n, -28n];
        let answers: Array<Cell> = [
            beginCell().storeUint(0, 32).storeStringTail("BA ba").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("CB cb").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("AZ az").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("BA ba").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("CB cb").endCell(),

            beginCell().storeUint(0, 32).storeStringTail("ZY zy").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("YX yx").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("AZ az").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("ZY zy").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("YX yx").endCell(),
        ]
        let text = beginCell().storeUint(0, 32).storeStringTail("AZ az").endCell()
        let gasUsed = 0n;
        for(let i = 0 ; i < shift.length ; i++) {
            let value = await task4.getCaesarCipherEncrypt(shift[i], text);
            gasUsed += value.gasUsed !== undefined && value.gasUsed !== null ? value.gasUsed : 0n;
            expect(value.stack.readCell()).toEqualCell(answers[i]);
        }
    });

    it('should deploy', async () => {
        let shift: Array<bigint> = [1n, 2n, 26n, 27n, 28n, -1n, -2n, -26n, -27n, -28n];
        let answers: Array<Cell> = [
            beginCell().storeUint(0, 32).storeStringTail("ZY zy").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("YX yx").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("AZ az").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("ZY zy").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("YX yx").endCell(),

            beginCell().storeUint(0, 32).storeStringTail("BA ba").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("CB cb").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("AZ az").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("BA ba").endCell(),
            beginCell().storeUint(0, 32).storeStringTail("CB cb").endCell(),
        ]
        let text = beginCell().storeUint(0, 32).storeStringTail("AZ az").endCell()
        let gasUsed = 0n;
        for(let i = 0 ; i < shift.length ; i++) {
            let value = await task4.getCaesarCipherDecrypt(shift[i], text);
            gasUsed += value.gasUsed !== undefined && value.gasUsed !== null ? value.gasUsed : 0n;
            expect(value.stack.readCell()).toEqualCell(answers[i]);
        }
        console.log(gasUsed);
    });
});
