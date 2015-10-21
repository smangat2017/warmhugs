 (function(window, document, undefined) {
 $('#key').on('input',function(e){
        var user_input = $('#key').val();
        var params = {secretkey: $(this).val()};
          console.log(params);
          $.ajax({
              url: '/user',
              data: params,
              complete: function(xhr,statusText){
                if(xhr.status!=200){
                  $('#kudosubmit').prop('disabled',true);
                  $('#responsive').addClass('has-error');
                  $('#responsive').removeClass('has-success');
                } else{
                  $('#kudosubmit').prop('disabled',false);
                  $('#responsive').addClass('has-success');
                   $('#responsive').removeClass('has-error');
                }
              }
          });
      });
})(this, this.document);
