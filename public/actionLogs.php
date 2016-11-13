<?php
//
// Description
// -----------
// This function will get the history of a field from the qruqsp_core_api_logs table.
// This allows the user to view what has happened to a data element, and if they
// choose, revert to a previous version.
//
// Arguments
// ---------
// api_key:
// auth_token:
// last_timestamp:          The last timestamp from the previous request.
// session_key:             The session key to get only the action logs from.
//
function qruqsp_admin_actionLogs($q) {
    //
    // Get the args
    //
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'prepareArgs');
    $rc = qruqsp_core_prepareArgs($q, 'no', array(
        'last_timestamp'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Last Timestamp'),
        'session_key'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Session Key'),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];

    //
    // Check access restrictions to monitorActionLogs
    //
    qruqsp_core_loadMethod($q, 'qruqsp', 'admin', 'private', 'checkAccess');
    $rc = qruqsp_admin_checkAccess($q, 0, 'qruqsp.admin.actionLogs');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'datetimeFormat');
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbQuote');
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbRspQuery');
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbHashQuery');

    $strsql = "SELECT UNIX_TIMESTAMP(UTC_TIMESTAMP()) as cur";
    $ts = qruqsp_core_dbHashQuery($q, $strsql, 'qruqsp.core', 'timestamp');
    if( $ts['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.core.389', 'msg'=>'No timestamp available'));
    }

    //
    // Verify the field was passed, and is valid.
    //
    $last_timestamp = $ts['timestamp']['cur'] - 43200;      // Get anything that is from the last 12 hours by default.
    $last_timestamp = $ts['timestamp']['cur'] - 86400;      // Get anything that is from the last 24 hours by default.
    $req_last_timestamp = $last_timestamp;
    if( isset($args['last_timestamp']) && $args['last_timestamp'] != '' ) {
        $req_last_timestamp = $args['last_timestamp'];
    }
    // Force last_timestamp to be no older than 1 week
    if( $req_last_timestamp < ($ts['timestamp']['cur'] - 604800) ) {
        $req_last_timestamp = $ts['timestamp']['cur'] - 604800;
    }

    $date_format = qruqsp_core_datetimeFormat($q);

    // Sort the list ASC by date, so the oldest is at the bottom, and therefore will get insert at the top of the list in qruqsp manage
    $strsql = "SELECT DATE_FORMAT(log_date, '" . qruqsp_core_dbQuote($q, $date_format) . "') as log_date, "
        . "CAST(UNIX_TIMESTAMP(UTC_TIMESTAMP())-UNIX_TIMESTAMP(log_date) as DECIMAL(12,0)) as age, "
        . "UNIX_TIMESTAMP(log_date) as TS, "
        . "qruqsp_core_api_logs.id, "
        . "qruqsp_core_api_logs.user_id, "
        . "qruqsp_core_users.display_name, "
        . "IFNULL(qruqsp_core_stations.name, 'System Admin') AS name, "
        . "qruqsp_core_api_logs.session_key, "
        . "qruqsp_core_api_logs.method, "
        . "qruqsp_core_api_logs.action "
        . "FROM qruqsp_core_api_logs "
        . "LEFT JOIN qruqsp_core_users ON ("
            . "qruqsp_core_api_logs.user_id = qruqsp_core_users.id"
            . ") "
        . "LEFT JOIN qruqsp_core_stations ON ("
            . "qruqsp_core_api_logs.station_id = qruqsp_core_stations.id"
            . ") ";
    if( isset($args['session_key']) && $args['session_key'] != '' ) {
        $strsql .= "WHERE session_key = '" . qruqsp_core_dbQuote($q, $args['session_key']) . "' ";
    } else {
        $strsql .= "WHERE UNIX_TIMESTAMP(qruqsp_core_api_logs.log_date) > '" . qruqsp_core_dbQuote($q, $req_last_timestamp) . "' ";
    }
//      . "AND qruqsp_core_api_logs.user_id = qruqsp_users.id "
    $strsql .= ""
        . "ORDER BY TS DESC "
        . "LIMIT 100 ";
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = qruqsp_core_dbHashQueryArrayTree($q, $strsql, 'qruqsp.core', array(
        array('container'=>'logs', 'fname'=>'id', 'fields'=>array('id', 'log_date', 'age', 'TS', 'user_id', 'display_name', 'name', 'session_key', 'method', 'action')),
        ));
    $rsp = $rc;
    if( $rsp['stat'] == 'ok' ) {
        $rsp['timestamp'] = $ts['timestamp']['cur'];
    }

    return $rsp;
}
?>
