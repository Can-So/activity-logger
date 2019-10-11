pragma solidity 0.4.25;

contract ActivityLogger {

    event LogActivity(string id, string multiHash, uint256 timestamp, string metadata);

    function logActivity(string _id, string _multiHash, string _metadata) external returns(bool) {
        emit LogActivity(_id, _multiHash, block.timestamp, _metadata);
        return true;
    }
}