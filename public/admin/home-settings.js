var homeSettingsData={menuItems:[],languages:[],heroSlides:[]};
async function loadHomeSettings(){try{const r=await fetch('/api/home-settings',{headers:{'Authorization':'Bearer '+localStorage.getItem('accessToken')}});const d=await r.json();if(d.success){homeSettingsData=d.data;renderMenuItems();renderLanguages();renderHeroSlides();populateHeroForm()}}catch(e){console.error('Error:',e)}}
function renderMenuItems(){var c=document.getElementById('menuItemsList');if(!c)return;var i=homeSettingsData.menuItems||[];var h='';for(var x=0;x<i.length;x++){var t=i[x];h+='<div style="display:flex;gap:12px;padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:8px"><input value="'+t.label+'" onchange="updateMenuItem('+x+",'label',this.value)"+'" style="flex:1;padding:8px;border:1px solid #e5e7eb;border-radius:4px"><input value="'+t.link+'" onchange="updateMenuItem('+x+",'link',this.value)"+'" style="flex:1;padding:8px;border:1px solid #e5e7eb;border-radius:4px"><button onclick="removeMenuItem('+x+')" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">X</button></div>'}c.innerHTML=h}
function updateMenuItem(i,f,v){homeSettingsData.menuItems[i][f]=v}
function removeMenuItem(i){homeSettingsData.menuItems.splice(i,1);renderMenuItems()}
function addNewMenuItem(){var l=document.getElementById('newMenuLabel').value.trim();var k=document.getElementById('newMenuLink').value.trim();if(!l||!k){alert('Menyu nomi va havola kerak');return}homeSettingsData.menuItems.push({id:'menu_'+Date.now(),label:l,link:k,enabled:true});document.getElementById('newMenuLabel').value='';document.getElementById('newMenuLink').value='';renderMenuItems()}
function renderLanguages(){var c=document.getElementById('languagesList');if(!c)return;var l=homeSettingsData.languages||[];var h='';for(var x=0;x<l.length;x++){var t=l[x];h+='<div style="display:flex;gap:12px;padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:8px"><span style="font-size:24px">'+t.flag+'</span><span style="font-weight:600">'+t.code.toUpperCase()+'</span><span style="flex:1">'+t.name+'</span><button onclick="removeLanguage('+x+')" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">X</button></div>'}c.innerHTML=h}
function updateLanguage(i,f,v){homeSettingsData.languages[i][f]=v;renderLanguages()}
function removeLanguage(i){homeSettingsData.languages.splice(i,1);renderLanguages()}
function addNewLanguage(){var c=document.getElementById('newLangCode');var n=document.getElementById('newLangName');var f=document.getElementById('newLangFlag');if(!c||!n)return;var cv=c.value.trim().toLowerCase();var nv=n.value.trim();var fv=f?f.value.trim():'';if(!cv||!nv){alert('Til kodi va nomi kerak');return}homeSettingsData.languages.push({code:cv,name:nv,flag:fv,enabled:true});c.value='';n.value='';if(f)f.value='';renderLanguages()}
function renderHeroSlides(){var c=document.getElementById('heroSlidesList');if(!c)return;var s=homeSettingsData.heroSlides||[];var h='';for(var x=0;x<s.length;x++){var t=s[x];h+='<div style="display:flex;gap:12px;padding:12px;background:#f9fafb;border-radius:8px;margin-bottom:8px"><img src="'+t.image+'" style="width:120px;height:60px;object-fit:cover;border-radius:4px"><span style="flex:1">Slide '+(x+1)+'</span><button onclick="removeSlide('+x+')" style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">X</button></div>'}c.innerHTML=h}
function updateSlide(i,f,v){homeSettingsData.heroSlides[i][f]=v}
function removeSlide(i){homeSettingsData.heroSlides.splice(i,1);renderHeroSlides()}
var newSlideFile=null;
function previewNewSlide(i){var f=i.files[0];if(f){newSlideFile=f;var r=new FileReader();r.onload=function(e){document.getElementById('newSlidePreview').src=e.target.result;document.getElementById('newSlidePreview').style.display='block'};r.readAsDataURL(f)}}
async function addNewSlide(){if(!newSlideFile){alert('Rasm tanlang');return}var d=new FormData();d.append('image',newSlideFile);try{var r=await fetch('/api/upload',{method:'POST',headers:{'Authorization':'Bearer '+localStorage.getItem('accessToken')},body:d});var j=await r.json();if(j.success){homeSettingsData.heroSlides.push({id:'slide_'+Date.now(),image:j.data.url,enabled:true});newSlideFile=null;renderHeroSlides()}}catch(e){alert('Rasm yuklashda xatolik')}}
function populateHeroForm(){var a=document.getElementById('heroTitleInput');var b=document.getElementById('heroSubtitleInput');var c=document.getElementById('heroButtonTextInput');var d=document.getElementById('heroButtonLinkInput');if(a)a.value=homeSettingsData.heroTitle||'';if(b)b.value=homeSettingsData.heroSubtitle||'';if(c)c.value=homeSettingsData.heroButtonText||'';if(d)d.value=homeSettingsData.heroButtonLink||''}
async function saveHomeSettings(){
    var phoneInput = document.getElementById('phoneNumberInput');
    var showPhoneToggle = document.getElementById('showPhoneToggle');
    var d = {
        menuItems: homeSettingsData.menuItems,
        showPhone: showPhoneToggle ? showPhoneToggle.checked : true,
        phoneNumber: phoneInput ? phoneInput.value : '+998932244333',
        languages: homeSettingsData.languages,
        defaultLanguage: homeSettingsData.defaultLanguage || 'en',
        heroSlides: homeSettingsData.heroSlides,
        heroTitle: document.getElementById('heroTitleInput') ? document.getElementById('heroTitleInput').value : '',
        heroSubtitle: document.getElementById('heroSubtitleInput') ? document.getElementById('heroSubtitleInput').value : '',
        heroButtonText: document.getElementById('heroButtonTextInput') ? document.getElementById('heroButtonTextInput').value : '',
        heroButtonLink: document.getElementById('heroButtonLinkInput') ? document.getElementById('heroButtonLinkInput').value : ''
    };
    try {
        var r = await fetch('/api/home-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            body: JSON.stringify(d)
        });
        var j = await r.json();
        if (j.success) {
            homeSettingsData = j.data;
            if (typeof showNotification === 'function') {
                showNotification('Sozlamalar saqlandi!', 'success');
            } else {
                alert('Sozlamalar saqlandi!');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Xatolik: ' + j.message, 'error');
            } else {
                alert('Xatolik: ' + j.message);
            }
        }
    } catch (e) {
        console.error('Save error:', e);
        if (typeof showNotification === 'function') {
            showNotification('Saqlashda xatolik', 'error');
        } else {
            alert('Saqlashda xatolik');
        }
    }
}
function resetHomeSettings(){if(confirm('Qayta tiklash?')){loadHomeSettings()}}
