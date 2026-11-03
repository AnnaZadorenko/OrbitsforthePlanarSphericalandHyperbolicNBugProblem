
import { OrbitsRenderer } from './orbits-render.js';

const $ = id => document.getElementById(id);

const renderer = new OrbitsRenderer($('hypercubeCanvas'));

let geometry = 'planar';
let playing = false;

const pages = {
    'about-project': ['About the Project', 'about-project.txt'],
    'how-to-use': ['How to Use', 'how-to-use.txt'],
    'more-about': ['More about the N-Bug Problem', 'more-about.txt'],
    'references': ['References', 'references.txt'],
    'credits': ['Credits', 'credits.txt']
};

async function loadText(file, target) {
    try {
        const response = await fetch('content/' + file);

        if (!response.ok) {
            throw new Error('Not found');
        }

        target.textContent = await response.text();
    } catch {
        target.textContent =
            'Unable to load content/' + file +
            '. Please run the website using a local server.';
    }
}

function stop() {
    playing = false;
    renderer.pause();

    $('playButton').textContent = '▶ Play';
    $('statusPill').textContent = 'Ready';
    $('statusPill').classList.remove('playing');
}

function showGeometry(name) {
    stop();

    geometry = name;
    renderer.setGeometry(name);

    $('visualizationSection').classList.remove('is-hidden');
    $('projectSection').classList.add('is-hidden');

    const titles = {
        planar: 'Planar',
        spherical: 'Spherical',
        hyperbolic: 'Hyperbolic'
    };

    $('pageTitle').textContent = titles[name] + ' N-Bug Orbits';
    $('geometryBadge').textContent = titles[name];

    if ($('infoTitle')) {
        $('infoTitle').textContent = titles[name] + ' N-Bug Problem';
    }

    loadText(name + '.txt', $('infoText'));

    requestAnimationFrame(() => renderer.resize());
}

document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        console.log('Clicked:', button.textContent.trim());

        document.querySelectorAll('.nav-item').forEach(b => {
            b.classList.remove('active');
        });

        button.classList.add('active');

        document.querySelector('.sidebar').classList.remove('open');

        if (button.dataset.geometry) {
            showGeometry(button.dataset.geometry);
        } else {
            stop();

            $('visualizationSection').classList.add('is-hidden');
            $('projectSection').classList.remove('is-hidden');

            const [title, file] = pages[button.dataset.page];

            $('pageTitle').textContent = title;

            loadText(file, $('projectText'));
        }
    });
});

$('menuButton').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
});

$('playButton').addEventListener('click', () => {
    $('statusPill').textContent = 'Animation coming soon';
});

$('resetButton').addEventListener('click', () => {
    stop();
    renderer.reset();
});

$('speedRange').addEventListener('input', e => {
    const value = Number(e.target.value);

    $('speedValue').textContent = value.toFixed(1) + '×';

    renderer.setSpeed(value);
});

$('bugCount').addEventListener('input', e => {
    const value = Number(e.target.value);

    $('bugCountValue').textContent = value;

    stop();
    renderer.setBugCount(value);
});

$('bugsToggle').addEventListener('change', e => {
    renderer.setOptions({
        showBugs: e.target.checked
    });
});

$('pathToggle').addEventListener('change', e => {
    renderer.setOptions({
        showPath: e.target.checked
    });
});

$('fullscreenButton').addEventListener('click', async () => {
    const panel = document.querySelector('.visual-panel');

    if (document.fullscreenElement) {
        await document.exitFullscreen();
    } else {
        await panel.requestFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    $('fullscreenButton').textContent =
        document.fullscreenElement ? '✕' : '⛶';

    setTimeout(() => renderer.resize(), 60);
});

window.addEventListener('resize', () => renderer.resize());

showGeometry('planar');
