import pathlib
import shutil

def clean_pycache(root="."):
    root_path = pathlib.Path(root)
    removed = 0

    for pycache_dir in root_path.rglob("__pycache__"):
        try:
            shutil.rmtree(pycache_dir)
            print(f"Removed: {pycache_dir}")
            removed += 1
        except Exception as e:
            print(f"Failed to remove {pycache_dir}: {e}")

    # Optional: also clean stray .pyc/.pyo files
    for pyc_file in root_path.rglob("*.py[co]"):
        try:
            pyc_file.unlink()
            print(f"Removed file: {pyc_file}")
        except Exception as e:
            print(f"Failed to remove {pyc_file}: {e}")

    print(f"\n✅ Cleanup complete. Removed {removed} __pycache__ directories.")

if __name__ == "__main__":
    clean_pycache(".")
