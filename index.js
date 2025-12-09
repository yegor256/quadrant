/*
SPDX-FileCopyrightText: Copyright (c) 2025 Yegor Bugayenko
SPDX-License-Identifier: MIT
*/
const NAMES = [
  'Urgent & Important',
  'Not Urgent & Important',
  'Urgent & Not Important',
  'Not Urgent & Not Important'
];

$(function () {
  var data = JSON.parse(localStorage.getItem('quadrant-tasks')) || [[], [], [], []];

  function save() {
    localStorage.setItem('quadrant-tasks', JSON.stringify(data));
  }

  function render() {
    $('.quadrant').each(function (index) {
      var list = $(this).find('.tasks');
      list.empty();
      data[index].forEach(function (text, i) {
        var task = $('<div class="task" draggable="true"></div>');
        task.data('quadrant', index).data('index', i);
        task.append($('<span class="task-text"></span>').text(text));
        var actions = $('<div class="task-actions"></div>');
        actions.append($('<button class="task-btn delete">&#10005;</button>').data('quadrant', index).data('index', i));
        task.append(actions);
        list.append(task);
      });
    });
  }

  var dragged = null;

  $(document).on('dragstart', '.task', function (e) {
    dragged = {
      quadrant: $(this).data('quadrant'),
      index: $(this).data('index')
    };
    $(this).addClass('dragging');
    e.originalEvent.dataTransfer.effectAllowed = 'move';
  });

  $(document).on('dragend', '.task', function () {
    $(this).removeClass('dragging');
    $('.tasks').removeClass('drag-over');
    dragged = null;
  });

  $(document).on('dragover', '.tasks', function (e) {
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = 'move';
  });

  $(document).on('dragenter', '.tasks', function () {
    if (dragged) {
      $(this).addClass('drag-over');
    }
  });

  $(document).on('dragleave', '.tasks', function (e) {
    if (!$(this).has(e.relatedTarget).length) {
      $(this).removeClass('drag-over');
    }
  });

  $(document).on('drop', '.tasks', function (e) {
    e.preventDefault();
    if (!dragged) {
      return;
    }
    var target = $(this).closest('.quadrant').data('id');
    if (target !== dragged.quadrant) {
      var task = data[dragged.quadrant].splice(dragged.index, 1)[0];
      data[target].unshift(task);
      save();
      render();
    }
    $(this).removeClass('drag-over');
    dragged = null;
  });

  $('.add').on('click', function () {
    var quadrant = $(this).closest('.quadrant');
    var list = quadrant.find('.tasks');
    if (list.find('.task-input').length) {
      return;
    }
    var input = $('<input class="task-input" type="text" placeholder="Enter task...">');
    list.prepend(input);
    input.focus();
    input.on('keydown', function (e) {
      if (e.key === 'Enter' && input.val().trim()) {
        data[quadrant.data('id')].unshift(input.val().trim());
        save();
        render();
      } else if (e.key === 'Escape') {
        input.remove();
      }
    });
    input.on('blur', function () {
      if (input.val().trim()) {
        data[quadrant.data('id')].unshift(input.val().trim());
        save();
        render();
      } else {
        input.remove();
      }
    });
  });

  $(document).on('click', '.delete', function () {
    var q = $(this).data('quadrant');
    var i = $(this).data('index');
    data[q].splice(i, 1);
    save();
    render();
  });


  render();
});
