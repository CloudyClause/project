// jquery
$(function(){
    // 자바스크립트 코드나 제이쿼리 코드를 입력한다
    // btn1 버튼을 클릭하면 .parent안의 .box1을 숨긴다
    $("#btn1").click(function(){
        // box1을 선택해서 숨기는 함수
        $(".parent .box1").hide()
    })

    // show 버튼을 클릭하면 box1을 보이게 해라
    $("#btn2").click(function(){
        $(".parent .box1").show()
    })

    // toggle 버튼을 클릭하면 파란색 박스를 숨기기/보이기 전환
    $("#btn3").click(function(){
        $(".box2").toggle()
    })

    // Big 버튼을 클릭하면 box3의 크기를 두배로 400X400
    $("#btn4").click(function(){
        $(".box3").width(400)
        $(".box3").height(400)
    })

    // Small 버튼을 클릭하면 box3의 크기를 200X200
    $("#btn5").click(function(){
        $(".box3").width(200)
        $(".box3").height(200)
    })



})