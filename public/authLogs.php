<?php
//
// Description
// -----------
// This method will return the logs for user.
//
// Arguments
// ---------
// api_key:
// auth_token:
// user_id:             The ID of the user to get the logs for.
// limit:               (optional) The maximum number of logs to return, default is 25.
//
// Returns
// -------
//
function qruqsp_admin_authLogs($q) {

    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'prepareArgs');
    $rc = qruqsp_core_prepareArgs($q, 'no', array(
        'user_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'User'),
        'limit'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Limit'),
        ));
    $args = $rc['args'];

    //
    // Check access 
    //
    qruqsp_core_loadMethod($q, 'qruqsp', 'admin', 'private', 'checkAccess');
    $rc = qruqsp_admin_checkAccess($q, 0, 'qruqsp.admin.authLogs');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbQuote');
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbHashQueryArrayTree');
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'datetimeFormat');
    $date_format = qruqsp_core_datetimeFormat($q);

    // Sort the list ASC by date, so the oldest is at the bottom, and therefore will get 
    // insert at the top of the list in qruqsp-manage
    $strsql = "SELECT DATE_FORMAT(qruqsp_core_auth_log.log_date, '" . qruqsp_core_dbQuote($q, $date_format) . "') as log_date, "
        . "CAST((UNIX_TIMESTAMP(UTC_TIMESTAMP())-UNIX_TIMESTAMP(qruqsp_core_auth_log.log_date)) as DECIMAL(12,0)) as age, "
        . "UNIX_TIMESTAMP(qruqsp_core_auth_log.log_date) as TS, "
        . "qruqsp_core_auth_log.user_id, "
        . "qruqsp_core_users.display_name, "
        . "qruqsp_core_auth_log.api_key, "
        . "qruqsp_core_auth_log.ip_address, "
        . "qruqsp_core_auth_log.session_key "
        . "FROM qruqsp_core_auth_log, qruqsp_core_users  "
        . "WHERE qruqsp_core_auth_log.user_id = '" . qruqsp_core_dbQuote($q, $args['user_id']) . "' "
        . "AND qruqsp_core_auth_log.user_id = qruqsp_core_users.id "
        . "ORDER BY TS DESC ";
    
    if( isset($args['limit']) && $args['limit'] != '' && is_numeric($args['limit'])) {
        $strsql .= "LIMIT " . qruqsp_core_dbQuote($q, $args['limit']) . " ";
    } else {
        $strsql .= "LIMIT 25 ";
    }
    
    $rc = qruqsp_core_dbHashQueryArrayTree($q, $strsql, 'qruqsp.core', array(
        array('container'=>'logs', 'fname'=>'TS', 'fields'=>array('log_date', 'age', 'TS', 'user_id', 'display_name', 'api_key', 'ip_address', 'session_key')),
        ));
    $rsp = $rc;

    return $rsp;
}
?>
