// Adreste bir proje varsa (/#isler/...) doğru afiş seçilene kadar ilk afiş görünmesin.
if (location.hash.startsWith('#isler/')) document.documentElement.classList.add('bekle');
