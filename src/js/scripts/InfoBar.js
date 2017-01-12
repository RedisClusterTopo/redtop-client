function leftInfoBar(data) {
    var side = $("#sidebar-wrapper");

    side.empty();

    //Side bar is hidden if true
    if($("#wrapper").hasClass("leftMenuOff"))
        $("#wrapper").toggleClass("leftMenuOff");


    //Set the sidebar header
    var header = $("<h2></h2>");
    header.text(data.name);
    side.append(header);


    var infoTable = $("<table></table>");   //Holds entries to the side panel

    //Iterate through node data and create table entry for relevant attributes
    $.each(data, function(k, v){
        if(k != "children"){
            var row = $("<tr></tr>");

            if (k == "hash" && v.length != 0) {
                var hashList = $("<select> </select>");

                v.forEach(function(range){
                    var listEntry = $("<option>" + range.lower.toString() + " - " + range.upper.toString() +" </option>");
                    hashList.append(listEntry);
                });

                row.append("<td id=\"hashRow\">" + k + ": " + "</td>");

                row.append(hashList);
            }
            else {
                row.append($("<td>" + k + ": " + v + "</td>"));
            }

            infoTable.append(row);
        }
    });

    side.append(infoTable);

    //Button/link for closing the side bar
    side.append($("<div style=\"text-align:center;\" id=\"btnContainer\">"));
    $("#btnContainer").append($("<input type=\"button\" id=\"leftMenuBtn\" value=\"Close\"/>"));
    side.append($("<a href=\"#leftMenuToggle\" class=\"btn btn-default\" id=\"leftMenuToggle\" hidden>Toggle Menu</a>"));

    $("#leftMenuBtn").click(function(e) {
        $("#leftMenuToggle").click();
        e.preventDefault();
        $("#wrapper").toggleClass("leftMenuOff");
        removeFocus();
    });
}
