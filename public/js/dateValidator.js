function toggleCompletionDateField() {
    const status = document.getElementById("status").value;
    const completionDateField = document.getElementById("completionDateField");
    if (status === "Completed") {
      completionDateField.style.display = "block";
    } else {
      completionDateField.style.display = "none";
    }
  }

  // Initialize the completion date field on page load
  window.onload = function() {
    toggleCompletionDateField();
  };