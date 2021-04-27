function openSettingPanel() {
    document.getElementById("setting_panel").style.width = "50%";
    document.getElementById("main").style.marginLeft = "50%";
    document.body.style.backgroundColor = "rgba(0,0,0,0.25)";
}

function closeSettingPanel() {
    document.getElementById("setting_panel").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = '#F2F0EB'
  }