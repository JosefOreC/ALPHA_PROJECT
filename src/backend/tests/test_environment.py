from infrastructure import config


def test_current_env_file_replaces_values_inherited_from_an_old_terminal(tmp_path, monkeypatch):
    monkeypatch.setattr(config, '__file__', str(tmp_path / 'src/backend/infrastructure/config.py'))
    monkeypatch.setenv('DATABASE_URL', 'postgresql://localhost/old_database')
    env_file = tmp_path / '.env'
    env_file.write_text('DATABASE_URL=postgresql://localhost/seed_database\n', encoding='utf-8')
    config.load_environment()
    import os
    assert os.environ['DATABASE_URL'] == 'postgresql://localhost/seed_database'
    env_file.write_text('DATABASE_URL=postgresql://localhost/another_database\n', encoding='utf-8')
    config.load_environment()
    assert os.environ['DATABASE_URL'] == 'postgresql://localhost/another_database'
