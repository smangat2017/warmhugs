(function(window, document, undefined) {
  var value = localStorage.secretkey;;
  if(value!=null){
     $('#key').val(value);
     $('#kudosubmit').prop('disabled',false);
     $('#responsive').addClass('has-success');
  }

})(this, this.document);
