
angular.module('app.controllers', [])

.controller('reservarCtrl', ['$scope', '$stateParams','$http', '$ionicPopup', '$window',// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $http, $ionicPopup, $window) {
$scope.today= new Date();
$scope.today.setDate($scope.today.getDate($scope.today));
$scope.weekFirst= new Date();
$scope.weekLast= new Date();
$scope.weekDays= [{},{},{},{},{}];
var DAY_IN_MILIS= 86400000;

if ($window.localStorage.getItem("loginData") !== null){
  let loginData = JSON.parse(window.localStorage.getItem('loginData'));
  $scope.requiredCpf=loginData.cpf;
  $scope.numCartao=loginData.numCartao;
  $scope.buttonLembrar= true;
}
/*
if ($window.localStorage.getItem("requiredCpf") !== null && $window.localStorage.getItem("numCartao") !== null) {
    $scope.requiredCpf=$window.localStorage.getItem("requiredCpf");
    $scope.numCartao=$window.localStorage.getItem("numCartao");
    $scope.buttonLembrar= true;
  }
*/
if($scope.today.getDay()<4||($scope.today.getDay()===4&&$scope.today.getHours()<=16))
  $scope.weekFirst.setTime($scope.today.getTime()+(8-$scope.today.getDay())*DAY_IN_MILIS);
else
  $scope.weekFirst.setTime($scope.today.getTime()+(15-$scope.today.getDay())*DAY_IN_MILIS);

 $scope.weekFirst.setHours(7+($scope.today.getTimezoneOffset()-$scope.weekFirst.getTimezoneOffset())/60);
 $scope.weekFirst.setMinutes(30);
 $scope.weekFirst.setSeconds(0);
 $scope.weekLast.setTime($scope.weekFirst.getTime()+(4*DAY_IN_MILIS));
 $scope.timeLeft=($scope.weekFirst.getTime()-$scope.today.getTime()-(7*DAY_IN_MILIS))/1000;
 //$scope.timeLeft=15;
 for(i=0;i<5;i++){
   $scope.weekDays[i].date=new Date();
   $scope.weekDays[i].date.setTime($scope.weekFirst.getTime()+i*DAY_IN_MILIS);
   $scope.weekDays[i].dClass = "button-stable button-outline";
   $scope.weekDays[i].dStr = "";
 }
    $scope.selectDay = function(i){
      if ($scope.weekDays[i].dClass === "button-stable button-outline"){
                $scope.weekDays[i].dClass = "button-balanced";
                $scope.weekDays[i].dStr=($scope.weekDays[i].date.getDate()<10?'&txt_dias=0':'&txt_dias=')
                                          +$scope.weekDays[i].date.getDate()+'%2F'+
                                        ($scope.weekDays[i].date.getMonth()+1)+'%2F'+
                                        $scope.weekDays[i].date.getFullYear();
               console.log($scope.weekDays[i].dStr);
              }
    else{
        $scope.weekDays[i].dClass = "button-stable button-outline";
        $scope.weekDays[i].dStr='';
    }
    };
    $scope.updateTimeLeft= function(){
      $scope.timeLeft= -1;
      console.log($scope.timeLeft);
      $scope.$apply();
    }
    $scope.doLogin=function(){

      if ($scope.buttonLembrar){
        let loginData = {
          cpf: $scope.requiredCpf,
          numCartao: $scope.numCartao
        }
        $window.localStorage.setItem('loginData',JSON.stringify(loginData));
        /*
        $window.localStorage.setItem ("requiredCpf",$scope.requiredCpf);
        $window.localStorage.setItem("numCartao", Number($scope.numCartao));
        */
      }
      //$scope.requiredCpf=$scope.requiredCpf.toString();
      $scope.loading = true;
      var txtCpf= $scope.requiredCpf.substr(0,3)+'.'+$scope.requiredCpf.substr(3,3)+
                  '.'+$scope.requiredCpf.substr(6,3)+'-'+$scope.requiredCpf.substr(9,2);
      console.log("CPF: "+txtCpf + "Nº do Cartão: "+$scope.numCartao);
      $http({
            method: 'POST',
            url: 'https://sistemas.fc.unesp.br/ru/reserva.confirmacao.action',
            headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': '90'
            },
            data:   'tipoPeriodoReserva=SUBSIDIO'+
                     $scope.weekDays[0].dStr + $scope.weekDays[1].dStr +
                     $scope.weekDays[2].dStr + $scope.weekDays[3].dStr +
                     $scope.weekDays[4].dStr +
                    '&txt_cartao=' + $scope.numCartao +
                    '&txt_cpf=' + txtCpf

      }).then(function mySucces(response) {
          $scope.loading=false;
          let temp = document.implementation.createHTMLDocument();
          let ind;
          let titulo= 'Resultado'
          temp.body.innerHTML = response.data;
          console.log(temp.body.innerText.search('x'));
          if(temp.body.innerText.search('sucesso')==-1)
            ind=temp.body.innerText.indexOf('Atenção')-1;
          else {
            ind=temp.body.innerText.indexOf('Sua');
            titulo= temp.body.innerText.substring(temp.body.innerText.indexOf('Reserva'),ind-1);
          }
          var popupText= temp.body.innerText.substr(ind);
          $ionicPopup.alert({title: titulo,
                            subTitle: popupText,
                          });
          console.log(temp.body.innerText);
      }, function myError(response) {
          $scope.loading=false;
          console.log("Deu ruim!")
          $ionicPopup.alert({title: 'Erro',
                            subTitle: 'Falha ao se comunicar com o servidor',
                          });
          });
    }

}])

.controller('pendentesCtrl', ['$scope', '$stateParams', '$http', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $http) {
  $scope.existeRef= false;
  $scope.loadPend=false;
  $scope.changeCartao= function(){
    $scope.refeicoes= [];
    $scope.existeRef= false;
    $scope.loadPend= true;
    if($scope.numCartao!=null&&$scope.numCartao!=0){
        $scope.numCartao=$scope.numCartao.toString();
        console.log($scope.numCartao);
        $http({
              method: 'POST',
              url: 'https://sistemas.fc.unesp.br/ru/reserva.pesquisar.action',
              headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': '15'
              },
              data:   'txt_cartao='+$scope.numCartao

        }).then(function mySucces(response) {
            let temp = document.implementation.createHTMLDocument();
            temp.body.innerHTML = response.data;
            var resultext = temp.body.innerText.substr(temp.body.innerText.indexOf('DataValor')+9).trim();
            console.log(resultext+"FIM");
            if(resultext.length!=0){
              console.log("String não vazia");
              $scope.existeRef= true;
              let sbString;
              let cont=0;
              while(sbString=resultext.substr(cont*17,17)){
                console.log("Entrou no while");
                let quebrado= sbString.split("R$");
                $scope.refeicoes.push({dia:quebrado[0],valor:quebrado[1]});
                cont++;
              }
              console.log($scope.refeicoes);
              }
              $scope.loadPend=false;


          }, function myError(response) {
              console.log("Deu ruim!");
              $scope.loadPend=false;
              });
    }
    else
    $scope.loadPend=false;
  }


}])

.controller('cardPioCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('sobreCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
.controller('envioCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
