$(function(){

    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', ()=>{
        if(!confirm('confirmDeletion')){
            return false;
        }
    });

});