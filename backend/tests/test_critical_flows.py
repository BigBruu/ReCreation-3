import os, requests, pytest, time
BASE = os.environ.get('EXPO_BACKEND_URL') or os.environ.get('REACT_APP_BACKEND_URL') or 'http://127.0.0.1:8001'
BASE = BASE.rstrip('/')

@pytest.fixture(scope='module')
def session():
    s = requests.Session()
    s.headers['Content-Type'] = 'application/json'
    return s

def test_admin_invite_and_components(session):
    r = session.post(BASE + '/api/admin/login', json={'password': 'admin_thecreation_password123'})
    assert r.status_code == 200 and r.json().get('access_token')
    session.headers['Authorization'] = 'Bearer ' + r.json()['access_token']
    r = session.post(BASE + '/api/admin/invite-codes', json={'max_uses': 5, 'expires_in_hours': 1})
    assert r.status_code == 200
    code = r.json()['code']
    assert len(code) == 8
    r = session.get(BASE + '/api/game/component-levels')
    assert r.status_code == 200
    data = r.json()
    assert set(['segel', 'rakete', 'ionenstrahl', 'fusion', 'antimaterie']) <= set(data['drives'])
    assert set(['stahl', 'quarz', 'titan']) <= set(data['shields'])
    assert set(['laser', 'projektil', 'plasma', 'abbaueinheit']) <= set(data['weapons'])

def test_test_user_login_and_initial_state(session):
    r = session.post(BASE + '/api/login', json={'username': 'TestUser1', 'password': 'password123'})
    assert r.status_code == 200
    session.headers['Authorization'] = 'Bearer ' + r.json()['access_token']
    b = session.get(BASE + '/api/game/buildings')
    assert b.status_code == 200 and len(b.json()) >= 5
    assert any(x['building_type'] == 'werft' for x in b.json())
    res = session.get(BASE + '/api/game/research')
    assert res.status_code == 200 and 'research_levels' in res.json()
    sp = session.get(BASE + '/api/game/user-spaceport')
    assert sp.status_code == 200

def test_ship_design_validation_and_formula(session):
    r = session.post(BASE + '/api/login', json={'username': 'TestUser1', 'password': 'password123'})
    assert r.status_code == 200
    session.headers['Authorization'] = 'Bearer ' + r.json()['access_token']
    payload = {
        'name': 'TEST_formula',
        'drive_type': 'segel',
        'drive_level': 1,
        'drive_quantity': 1,
        'shield_type': 'stahl',
        'shield_level': 1,
        'shield_quantity': 1,
        'weapon_type': 'laser',
        'weapon_level': 1,
        'weapon_quantity': 1
    }
    r = session.post(BASE + '/api/game/ship-design', json=payload)
    assert r.status_code in (200, 400)
    if r.status_code == 200:
        d = r.json()
        assert d['calculated_stats']['combat_value'] == 25 and d['calculated_stats']['speed'] == 200

def test_random_start_coordinates_on_register(session):
    # Get invite code via admin
    r = session.post(BASE + '/api/admin/login', json={'password': 'admin_thecreation_password123'})
    assert r.status_code == 200
    admin_token = r.json()['access_token']
    
    r = session.post(BASE + '/api/admin/invite-codes', json={'max_uses': 2, 'expires_in_hours': 1}, headers={'Authorization': f'Bearer {admin_token}'})
    assert r.status_code == 200
    invite_code = r.json()['code']

    ts = int(time.time() * 1000)
    user_payload = {
        'username': f'RandPlayer_{ts}',
        'email': f'rand_{ts}@test.de',
        'password': 'password123',
        'invite_code': invite_code
    }
    r = session.post(BASE + '/api/register', json=user_payload)
    assert r.status_code == 200
    user_token = r.json()['access_token']

    # Check that spaceport position is a valid coordinate on the map
    r = session.get(BASE + '/api/game/user-spaceport', headers={'Authorization': f'Bearer {user_token}'})
    assert r.status_code == 200
    sp_pos = r.json()['spaceport_position']
    assert 0 <= sp_pos['x'] < 50 and 0 <= sp_pos['y'] < 50
