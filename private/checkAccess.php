<?php
//
// Description
// -----------
// This function will check if the user has access to the admin module.
//
// Arguments
// ---------
// q:
// station_id:                  The ID of the station to check the session user against.
// method:                      The requested method.
//
function qruqsp_admin_checkAccess(&$q, $station_id, $method) {
    //
    // Sysadmins are allowed full access
    //
    if( ($q['session']['user']['perms'] & 0x01) == 0x01 ) {
        return array('stat'=>'ok');
    }
    //
    // By default fail
    //
    return array('stat'=>'fail', 'err'=>array('code'=>'qruqsp.admin.1', 'msg'=>'Access denied'));
}
?>
