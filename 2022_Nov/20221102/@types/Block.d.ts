// 블럭 타입 정의

// header의 타입 정의!
// I는 interface의 약자
declare interface IBlockHeader {
    version: string;
    height: number;
    timestamp: number;
    previousHash: string;
}

// 상속시켜서 만들어준다
declare interface IBlock extends IBlockHeader {
    merkleRoot: string;
    hash: string;
    nonce: number;
    difficulty: number;
    data: string[];
}

// 블록 생성을 하는 클래스를 만들 때 블록 헤더 부분을 만들어준느 클래스를 구분해서 따로 만들고 header를 상속 받아 온다.

// nonce, difficulty 이 속성들은 차후에 채굴 난이도와 마이닝 부분을 구현할 때 사용할 속성