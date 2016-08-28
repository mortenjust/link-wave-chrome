console.log("hej")

// Saves options to chrome.storage
function save_options() {
  var maxTabs = document.getElementById('max-tabs').value;
  var autoOpen = document.getElementById('auto-open').checked;
  chrome.storage.sync.set({
    maxTabs: maxTabs,
    autoOpen: autoOpen
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Saved!';
  });
  }

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  console.log("restore options")
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    maxTabs: 10,
    autoOpen: false
  }, function(items) {
    document.getElementById('max-tabs').value = items.maxTabs;
    document.getElementById('auto-open').checked = items.autoOpen;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
