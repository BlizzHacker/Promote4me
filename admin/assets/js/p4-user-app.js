$(document).ready(function(){
    var edit_user_id = 0;

    $('body').on('click','.edit_user',function(){
        edit_user_id = $(this).attr('data-user-id');
        
        show_modal_loader();
        
        $('#edit_user_modal').modal('show');
        $('#save_success_alert').addClass('hidden');

        $.ajax({
            url : SUBSCRIBER_API + "/getuser?id=" + edit_user_id + "&token=" + $.cookie('access_token'),
            success : function(data)
            {
                $('#user_first_name').val(data.first_name);
                $('#user_last_name').val(data.last_name);
                $('#user_email_address').val(data.email_address);
                $('#user_phone_number').val(data.phone_number);
                $('#user_type').val(data.user_type);
                $('#edit_user_modal').attr('data-user-id',edit_user_id);
                
                hide_modal_loader();
            }
        });
    });
    
    $('#save_user').click(function(){
        show_modal_loader();
        
        var fname = $('#user_first_name').val();
        var lname = $('#user_last_name').val();
        var utype = $('#user_type').val();
        var phone = $('#user_phone_number').val();
        
        var edit_obj = 
        {
            "first_name" : fname,
            "last_name" : lname,
            "user_type" : utype,
            "phone_number" : phone
        };
        
        $.ajax({
            url : SUBSCRIBER_API + "/edituser?id=" + edit_user_id + "&token=" + $.cookie('access_token'),
            method: "POST",
            data : { "ue" : edit_obj },
            success : function(data)
            {
                hide_modal_loader();
                if(data.status == "ok")
                {
                    $('#save_success_alert').removeClass('hidden');
                    reset_table();
                }
            }
        });
    });
    
    $('#send_invite').click(function(){
        var email = $('#invite_email').val();
        
        $.ajax({
            url : SUBSCRIBER_API + '/invite?token=' + $.cookie('access_token'),
            method : 'POST',
            data : { "email" : email },
            success : function(data){
            }
        });
    });

    $('#delete_user').click(function(){
        show_modal_loader();
        $.ajax({
            url : SUBSCRIBER_API + "/deleteuser?id=" + edit_user_id + "&token=" + $.cookie('access_token'),
            method: "GET",
            success : function(data)
            {
                hide_modal_loader();
                reset_table();
            }
        });
        
        $('#edit_user_modal').modal('hide');
    });

    var user_table = $('#data-table').DataTable( {
        deferRender:    true,
        dom:            "frtiS",
        scrollY:        320,
        scrollCollapse: true,
        columnDefs : 
        [
            { 
                "targets" : 0,
                "width" : "100px",
                render : function(data,type,row,meta)
                {
                    return "<a href='javascript:;' class='edit_user' data-user-id='" + row[5] + "'>Edit</a>";
                }
            },
            {
                "targets" : 5,
                "visible" : false
            }
        ]
    });
    
    function reset_table()
    {
        user_table.rows().remove();
        $.ajax({
            method : "GET",
            url : SUBSCRIBER_API + "/users?token=" + $.cookie('access_token'),
            success: function(data){
                $(data).each(function(){
                    user_table.row.add(["edit",this.first_name,this.last_name,this.phone_number,this.email_address,this.user_id]);
                });

                user_table.draw();
                fade_out_spinner();
            }
        });
    }
    
    reset_table();
});