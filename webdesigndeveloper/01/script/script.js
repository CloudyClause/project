$(function(){
    // 마우스 hover시 부드럽게 보임
    $(".gnb>li").mouseenter(function(){
        $(".depth2").fadeIn()
    })
    //  마우스 영역을 벗어났을떄 부드럽게 사라짐
    $(".gnb").mouseleave(function(){
        $(".depth2").fadeOut()
    })

    // 첫번째 공지사항을 클릭하면 팝업창을 출력
    $(".first").click(function(){
        $(".popup").show()
    })
    //  닫기버튼을 클릭하면 팝업창이 숨김
    $("button").click(function(){
        $(".popup").hide()
    })

    // 탭기능

    $(".tab li").click(function(){
        let num = $(this).index()
        console.log(num)
        // 기존의 on class 모두 제거
        $(".tab li").removeClass("on")
        $(this).addClass("on")
        // 기존의 보이는 tab은 모두 숨기기
        $(".wrap").hide()
        // 선택된 번쨰 와 같은 번째
        $(".wrap").eq(num).show()

    })

    // 상하슬라이드 초 단위로 반복 처리 함수
    setInterval(function(){
        $(".slide ul").animate({top:'-=' + 300},'slow', function(){
            $(".slide ul li").first().appendTo(".slide ul")
            $(".slide ul").css('top',0)
        })
    },3000)


})



