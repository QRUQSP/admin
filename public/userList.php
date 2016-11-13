<?php
//
// Description
// -----------
// This function will get the list of all users in the system.
//
// Arguments
// ---------
// api_key:
// auth_token:
//
//
function qruqsp_admin_userList($q) {
    //
    // Check access 
    //
    qruqsp_core_loadMethod($q, 'qruqsp', 'admin', 'private', 'checkAccess');
    $rc = qruqsp_admin_checkAccess($q, 0, 'qruqsp.admin.userList');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Query for the all users
    //
    $strsql = "SELECT id, email, username, callsign, license, perms, status, display_name "
        . "FROM qruqsp_core_users "
        . "ORDER BY callsign "
        . "";
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = qruqsp_core_dbHashQueryArrayTree($q, $strsql, 'qruqsp.core', array(
        array('container'=>'users', 'fname'=>'id', 'fields'=>array('id', 'email', 'username', 'callsign', 'license', 'perms', 'status', 'display_name')),
        ));
    return $rc;
}
?>
