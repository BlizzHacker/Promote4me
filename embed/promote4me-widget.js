(function () {
  var script = document.currentScript;
  var host = script.getAttribute('data-p4me-api') || 'https://your-domain.com';
  var company = script.getAttribute('data-p4me-company') || 'Promote4.me';
  var containerId = script.getAttribute('data-p4me-container') || 'promote4me-delivery-widget';
  var tracking = script.getAttribute('data-p4me-tracking') || '';
  var container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  var src = host.replace(/\/$/, '') + '/?tracking=' + encodeURIComponent(tracking) + '&embed=1&company=' + encodeURIComponent(company);
  container.innerHTML = '<iframe title="' + company + ' Delivery Tracker" src="' + src + '" style="width:100%;min-height:720px;border:0;border-radius:18px;overflow:hidden" loading="lazy"></iframe>';
}());
