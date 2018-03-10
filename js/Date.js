(function(){ 
    
    /*
    * props is a object to Setting up render
    * props.years : the range of year from local time   
    * props.message : some notice message
    */

    function datePlugin(props){

        var pluginState = {
            "week" : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            "month" : ["January","February","March","April","May","June","July","Aguest","September","October","November","December"],
            "daysOfMonth" : [31,28,31,30,31,30,31,31,30,31,30,31],
            "showMessgae" : props["showMessgae"],
            "thisYear" : new Date().getFullYear(),
            "thisMonth" : new Date().getMonth(),
            "holiday" : ["0.1","4.1","5.1","7.15","9.1"]
        }
        var selectMonth,selectYear;
        Object.defineProperty(pluginState,"selectYear",{
            get : function (){
                return selectYear;
            }, 
            set : function(value){
                selectYear = value;
                daysControl( document.getElementById("day_layout") );
            }
        })

        Object.defineProperty(pluginState,"selectMonth",{
            get : function(){
                return selectMonth;
            }, 
            set : function(value){
                selectMonth = value;
                daysControl( document.getElementById("day_layout") );
            }
        })

        function isLeapYear(year){
            return ( year%4 === 0 ) ? ( year%100 !== 0 ? 1 : ( year%400 === 0 ? 1 : 0 ) ) : 0; 
        }

        function renderSelect(selectWrapper){
            var selectObj = document.createElement("select");
            selectObj.name = "select";
            var objOption = null;
            for( var i = props.years; i>=0; i-- ) {
                objOption = document.createElement("option");
                objOption.text= objOption.value = pluginState["thisYear"] - i;
                if( i ==0 ){
                    objOption.selected = "selected";
                }
                selectObj.appendChild(objOption); 
            } 
            selectObj.addEventListener("change",function(){
                selectValue = selectObj[selectObj.selectedIndex].value;
                year = parseInt(selectValue);
                pluginState["daysOfMonth"][1] += isLeapYear(year);
                pluginState["selectYear"] = year;
            });
            selectWrapper.appendChild(selectObj);
            return selectWrapper;
        }

        function renderMonth(monthGrounp){

            var ulObj = document.createElement("ul");
            for(var i = 0; i<pluginState["month"].length; i++ ){
                var  liObj = document.createElement("li");
                liObj.innerText = pluginState["month"][i];
                liObj["month"] = i;
                if( pluginState["thisMonth"] === i  ){
                    liObj.className = "hover"
                }
                ulObj.appendChild(liObj);
            }
            monthGrounp.appendChild(ulObj);
            ulObj.addEventListener("click",function(e){
                var liGroup = monthGrounp.getElementsByTagName("li");
                if( liGroup[(pluginState["thisMonth"])] && liGroup[(pluginState["thisMonth"])].className ==="hover" ){
                    liGroup[(pluginState["thisMonth"])].className= ""; 
                }
                if( pluginState["selectMonth"] !== undefined ){
                    months = monthGrounp.getElementsByTagName("li")[(pluginState["selectMonth"])];
                    months.className ="";
                }
                var selectMonth = e.target["month"];
                e.target.className += "hover";
                pluginState["selectMonth"] = selectMonth;
            })

            return monthGrounp;
        }

        function renderMessage(messageObj){
            var divWrapper = document.createElement("div");
            divWrapper.innerText = pluginState["showMessgae"];
            messageObj.appendChild(divWrapper);
            return messageObj;
        }

        function renderWeek(weekObj){
            var ulObj = document.createElement("ul");
            for(var i = 0; i <pluginState["week"].length; i++){
                var  liObj = document.createElement("li");
                liObj.innerText = pluginState["week"][i];
                liObj["week"] = i;
                ulObj.appendChild(liObj);
            }
            weekObj.appendChild(ulObj);
            return weekObj;
        }

        function daysControl(dayLayout){
            var year =  pluginState["selectYear"] ||  pluginState["thisYear"],
            month = ( pluginState["selectMonth"] || pluginState["selectMonth"] === 0 ) ? pluginState["selectMonth"] : pluginState["thisMonth"];
            var dateObj = new Date(year,month,1),week = dateObj.getDay(); 
            var wrapper = document.createElement("div");
            var daysOfMonth = pluginState["daysOfMonth"][month];
            var loopWeek = 0,loopDay = 0;
            for( var i = 0;i<week && loopDay < 35; i++,loopDay++ ){
                var preMonth = ( month === 0 ) ? 11 : ( month-1 ),
                day = pluginState["daysOfMonth"][preMonth] -i;
                wrapper.appendChild( renderDay(preMonth, day,loopWeek))  ;
                loopWeek = (++loopWeek)%7;      
            }

            for( i = 1; i<= daysOfMonth && loopDay < 35; i++,loopDay++ ){
                wrapper.appendChild( renderDay(month,i,loopWeek) );
                loopWeek = (++loopWeek)%7; 
            }

            var lastDay = week + pluginState["daysOfMonth"][month];
            if( lastDay < 35  ){
                var nextMonth = ( month === 11 ) ? 0 : ( month + 1 );
                for( var j =1; j <= (35-lastDay) && loopDay < 35 ; j++,loopDay++ ){
                    wrapper.appendChild( renderDay(nextMonth,j,loopWeek));
                    loopWeek = (++loopWeek)%7;  
                }

            }
            if( dayLayout.firstChild ) {
                dayLayout.removeChild( dayLayout.firstChild );
            };
            dayLayout.appendChild( wrapper );

            return dayLayout;
        }

        function renderDay(month,day,week){
            var wrapper = document.createElement("div");
            if( isHoliday( month+"."+day ) ) {
                if( week === 0 || week === 6 ){
                    wrapper.className = "every_day weekend"; 
                } else {
                    wrapper.className = "every_day holiday"; 
                }

            } else {
                if( week === 0 || week === 6  ){
                    wrapper.className = "every_day weekend";
                } else {
                    wrapper.className = "every_day";
                }
            }
            wrapper.innerHTML = dayMark(month,day,week);
            wrapper.innerHTML += "<span class='day'>" + ( ( ( month +1 ) > 9 ? (month +1) : ("0"+ ( month+1 ) ) ) + "-" + ( (  day > 9 ? day : ("0"+day)  ) ) ) +"</span>" ; 
            wrapper.innerHTML += todoList();    
            return wrapper;
        }

        function dayMark(month,day,week){
            if( isHoliday( month+"."+day ) ){
                return "<span class='day_state'>节假日</span>";
            } else {
                return ((week === 0 || week === 6) ? "<span class='day_state'>周末</span>" : "<span class='day_mark'>辛苦了</span><span class='day_state'>工作日</span>");
            }    
        }

        function isHoliday(dayStr){
            for( var i = 0; i < pluginState["holiday"].length; i++ ){
                if( dayStr === pluginState["holiday"][i] ){
                    return true;
                } 
            }
            return false;
        }

        function todoList(){
            return  ("<div class='todo_list'><ul><li>08:52:43</li><li>08:52:43</li></ul></div>");
        }

        function createWrapper(className,id){
            className = className || "";
            id = id || "";
            var wrapper = document.createElement("div");
            wrapper.className = className;
            wrapper.id = id;
            return wrapper;
        }

        function init(){

            var silder = createWrapper("silder");
            silder.appendChild( renderSelect( createWrapper("year_select","year_select" ) ) );
            silder.appendChild(renderMonth( createWrapper("month_select","month_select") ));
            silder.appendChild(renderMessage( createWrapper("message","month") ));
            props.root.appendChild(silder);

            var main = createWrapper("main");
            main.appendChild( renderWeek( createWrapper("week_layout","week_layout") ) );
            main.appendChild( daysControl( createWrapper("day_layout","day_layout") ) );
            props.root.appendChild(main);
        }

        // init plugin
        return init;
    }

    datePlugin({"years" : 10,
                "root" : document.getElementById("date_plugin"), 
                "showMessgae": "some message I can not see clear"
    })();
})()