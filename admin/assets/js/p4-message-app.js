$(document).ready(function(){
        $.ajax({
                method : "GET",
                url : MESSAGE_API + "/inbox?token=" + $.cookie('access_token'),
                success : function(data)
                {
                        $(data).each(function(){
                        	var row_html = "";

                        	row_html += '<tr>';
                                row_html += '<td class="email-sender">';
                                row_html +=  this.first_name + ' ' + this.last_name;
                                row_html += '</td>';
                                row_html += '<td class="email-subject">';
                                row_html += this.body;
                                row_html += '</td>';
                                row_html += '<td>';
                                row_html += '<a href="javascript:;" data-message-id="' + this.message_id + '" class="email-btn p4_delete_message" data-click="email-remove">';
                                row_html += '<i class="fa fa-trash-o"></i>';
                                row_html += '</a>'; 
                                row_html += '</td>';
                                row_html += '</tr>';

                                $('#email_table').children('tbody').append(row_html);
                        });
                }
        });

        $('#p4_send_message').click(function(){
                var to_user = $('#p4_user_selector').val();
                var message = $('#p4_message_body').val();

                var message_object = { "msg" : { "to" : to_user , "body" : message } };

                $.ajax({
                        url : MESSAGE_API + '/send?token=' + $.cookie('access_token'),
                        method : 'POST',
                        data : message_object,
                        success : function()
                        {
                                $('#p4_user_selector').val(0);
                                $('#p4_message_body').val('');

                                $('#new_message_modal').modal('hide');
                        }
                });
        });

        $('body').on('click','.p4_delete_message',function(){
                var deleted_message_element = this;

                var message_id = $(this).attr('data-message-id');

                $.get(MESSAGE_API + '/' + message_id + '/delete?token=' + $.cookie('access_token'),null,function(){ 
                        $(deleted_message_element).closest('tr').fadeOut(200,function(){ 
                                $(this).remove(); 
                        }); 
                });
        });
});