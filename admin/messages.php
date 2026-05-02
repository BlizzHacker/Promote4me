<?php 
    $PAGE_TITLE = "Messages";
    require_once('_header.php') 
?>

<!-- begin page-header -->
<h1 class="page-header">Messages</h1>
<!-- end page-header -->
<!-- begin col-10 -->
<div class="col-md-10">
    <div class="email-btn-row hidden-xs">
        <div class="form-group">
        	<a href="javascript:;" class="btn btn-sm btn-inverse" data-toggle="modal" data-target="#new_message_modal"><i class="fa fa-plus m-r-5"></i> New</a>
        </div>
    </div>
    <div class="email-content">
        <table id="email_table" class="table table-email">
            <tbody>
                
            </tbody>
        </table>
		
    </div>
</div>

<!-- end col-10 -->

<?php require_once('_scripts.php') ?>
<div id="new_message_modal" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">New Message</h4>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>To:</label>
                    <select id="p4_user_selector" class="form-control"></select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea id="p4_message_body" cols="30" rows="10" class="form-control" placeholder="Your message here..."></textarea>
                </div>
                <div class="clearfix">
                    <button class="btn btn-primary pull-right" id="p4_send_message">Send Message</button>
                </div>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<script src="assets/js/p4-message-app.js"></script>
<?php require_once('_footer.php') ?>