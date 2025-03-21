// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// ERC20.sol 가져오기
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ChanToken is ERC20 {
    string public _name = "ChanToken";
    string public _symbol = "CTK";
    uint256 public _totalSupply = 50000 * (10**decimals());

    // 클래스로 따지면 super()를 사용한 것과 같음
    // constructor() 옆에 붙여서
    constructor() ERC20(_name, _symbol) {
        // 배포한 계정으로 총 발행량을 준다.
        _mint(msg.sender, _totalSupply);
    }
}
