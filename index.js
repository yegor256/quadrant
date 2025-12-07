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
        var task = $('<div class="task"></div>');
        task.append($('<span class="task-text"></span>').text(text));
        var actions = $('<div class="task-actions"></div>');
        actions.append($('<button class="task-btn move">&#8644;</button>').data('quadrant', index).data('index', i));
        actions.append($('<button class="task-btn delete">&#10005;</button>').data('quadrant', index).data('index', i));
        task.append(actions);
        list.append(task);
      });
    });
  }

  function closeMenu() {
    $('.menu').remove();
  }

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

  $(document).on('click', '.move', function (e) {
    e.stopPropagation();
    closeMenu();
    var btn = $(this);
    var q = btn.data('quadrant');
    var i = btn.data('index');
    var menu = $('<div class="menu"></div>');
    NAMES.forEach(function (name, target) {
      if (target !== q) {
        var option = $('<button></button>').text(name);
        option.on('click', function () {
          var task = data[q].splice(i, 1)[0];
          data[target].unshift(task);
          save();
          render();
          closeMenu();
        });
        menu.append(option);
      }
    });
    var rect = btn[0].getBoundingClientRect();
    menu.css({
      top: rect.bottom + 4 + 'px',
      left: Math.min(rect.left, window.innerWidth - 180) + 'px'
    });
    $('body').append(menu);
  });

  $(document).on('click', function () {
    closeMenu();
  });

  render();
});
