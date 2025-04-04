import { SHA256 } from "crypto-js";
import merkle from "merkle";
import { BlockHeader } from "./blockHeader";
import {
    DIFFICULTY_ADJUSTMENT_INTERVAL,
    BLOCK_GENERATION_INTERVAL,
    BLOCK_GENERATION_TIME_UNIT,
    GENESIS,
} from "@core/config";
import hexToBinary from "hex-to-binary";

export class Block extends BlockHeader implements IBlock {
    public hash: string;
    public merkleRoot: string;
    public nonce: number;
    public difficulty: number;
    public data: string[];
    constructor(_previousBlock: Block, _data: string[], _adjustmentBlock: Block) {
        // 부모 클래스의 속성을 가져오기 위해 super tkdyd
        super(_previousBlock);
        this.merkleRoot = Block.getMerkleRoot(_data);
        // 자신의 해시값을 구해서 넣어준다.
        this.hash = Block.createBlockHash(this);
        this.nonce = 0;
        this.difficulty = Block.getDifficulty(this, _adjustmentBlock, _previousBlock);
        this.data = _data;
    }
    // 최초 블록 가져오는 함수
    public static getGENESIS(): Block {
        return GENESIS;
    }

    // 블록 추가 //
    public static generateBlock(
        _previousBlock: Block,
        _data: string[],
        _adjustmentBlock: Block
    ): Block {
        const generateBlock = new Block(_previousBlock, _data, _adjustmentBlock);

        const newBlock = Block.findBlock(generateBlock);
        return newBlock;
    }

    // 난이도 구현 함수
    public static getDifficulty(
        _newBlock: Block,
        _adjustmentBlock: Block,
        _previousBlock: Block
    ): number {
        if (_newBlock.height <= 9) return 0;
        if (_newBlock.height <= 10) return 1;

        // 10번째 배수의 볼록에 한해서만 난이도 구현
        // 10개의 묶음씩 같은 난이도를 가짐
        if (_newBlock.height % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0) {
            return _previousBlock.difficulty;
        }
        // 블록 1개당 생성시간 : 10분, 10개 생성되는데 걸리는 시간 6000초
        const timeTaken: number = _newBlock.timestamp - _adjustmentBlock.timestamp;
        const TimeExpected: number =
            BLOCK_GENERATION_INTERVAL *
            BLOCK_GENERATION_TIME_UNIT *
            DIFFICULTY_ADJUSTMENT_INTERVAL; // 6000

        if (timeTaken < TimeExpected / 2) return _adjustmentBlock.difficulty + 1;
        else if (timeTaken > TimeExpected * 2) return _adjustmentBlock.difficulty - 1;

        return _adjustmentBlock.difficulty;
    }

    // findBlock(). 마이닝 작업 코드
    public static findBlock(generateBlock: Block) {
        let hash: string;
        let nonce: number = 0;

        while (true) {
            nonce++;
            generateBlock.nonce = nonce;
            hash = Block.createBlockHash(generateBlock);
            // hex to binary (hash) : 16진수를 2진수로 변환
            // hexToBinary 모듈 설치 // npm i hex-to-binary //
            const binary: string = hexToBinary(hash);
            // startsWith() 함수는 대상의 문자열에 어떤 문자열로 시작하는지 체크 00000;
            const result: boolean = binary.startsWith(
                "0".repeat(generateBlock.difficulty)
            );
            if (result) {
                generateBlock.hash = hash;
                return generateBlock;
            }
        }
    }

    // 머클루트 변환 함수
    public static getMerkleRoot<T>(_data: T[]): string {
        const merkleTree = merkle("sha256").sync(_data);
        return merkleTree.root();
    }
    // 블록 해시 생성 함수
    public static createBlockHash(_block: Block): string {
        // difficulty, nonce
        const {
            version,
            timestamp,
            height,
            merkleRoot,
            previousHash,
            difficulty,
            nonce,
        } = _block;
        const values: string = `${version}${timestamp}${height}${merkleRoot}${previousHash}${difficulty}${nonce}`;
        return SHA256(values).toString();
    }
    // 블록 유효 검사 함수 (새로운 블록이 생성되면 검증) //
    public static isValidNewBlock(
        _newBlock: Block,
        _previousBlock: Block
    ): Failable<Block, string> {
        // 블록의 높이가 이전 블록보다 1이 증가된 상태인지 체크
        if (_previousBlock.height + 1 !== _newBlock.height)
            return { isError: true, value: "블록 높이 오류" };
        // 블록의 이전 블록 해시 값이 새로운 블록의 이전 블록 해시 값과 같은지 확인
        if (_previousBlock.hash !== _newBlock.previousHash)
            return { isError: true, value: "이전 해시 오류" };
        // 생성된 블록의 정보를 가지고 다시 해싱해서 생성된 블록의 해시값과 같은지 비교
        if (Block.createBlockHash(_newBlock) !== _newBlock.hash)
            return { isError: true, value: "블록 해시 오류" };

        return { isError: false, value: _newBlock };
    }
}
