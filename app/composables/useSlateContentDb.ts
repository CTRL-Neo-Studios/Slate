import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3';
import type { PossiblyRef } from '~/types/utility.types'
import { appDataDir, join } from '@tauri-apps/api/path'
import * as schema from '~~/server/database/schema'

export function useSlateContentDb() {
    const $slateBufferPath = useState<string>('scdb.slateBufferPath', () => '') // The path here must be an Absolute Path. // e.g. value: $APPDATA/Slate/.temp_buffer/[fileUUID]/
    const $slateDbPath = useState<string>('scdb.slateDbPath', () => '') // The path here must be an Absolute Path.// e.g. value: $APPDATA/Slate/.temp_buffer/[fileUUID]/content.db
    const $slateMigrationsPath = useState<string>('scdb.slateMigrationsPath', () => '') // The path here must be an Absolute Path.// e.g. value: $APPDATA/Slate/.temp_buffer/[fileUUID]/migrations
    const $isTransacting = useState<boolean>('scdb.isTransacting', () => false)

    /**
     * Loads the database from the set `$slateDbPath` and `$slateBufferPath` and returns the drizzle database ORM instance.
     *
     * # Notice
     * This function will throw an error if `$slateDbPath` or `$slateBufferPath` are unset.
     */
    function loadAndMigrateDb() {
        if(!unref($slateDbPath) || !unref($slateBufferPath) || !unref($slateMigrationsPath))
            throw new Error('No Database or Buffer Path is set.')

        const sqlite = new Database(unref($slateDbPath))
        let _db = drizzle({
            schema: schema,
            client: sqlite
        })

        migrate(_db, {
            migrationsFolder: unref($slateMigrationsPath)
        })

        return _db
    }

    function db() {
        return loadAndMigrateDb()
    }

    /**
     * Sets the database path.
     * @param value The path to the DB.
     * @param relative Whether the provided path to the DB is relative or not.
     */
    async function setDbPath(value: PossiblyRef<string>, relative: boolean = true) {
        let base = unref(value)
        if(relative)
            base = await join(await appDataDir(), base)
        $slateDbPath.value = unref(base)
        return unref($slateDbPath)
    }

    /**
     * Sets the buffer path.
     * @param value The path to the buffer.
     * @param relative Whether the provided path to the buffer is relative or not.
     */
    async function setBufferPath(value: PossiblyRef<string>, relative: boolean = true) {
        let base = unref(value)
        if(relative)
            base = await join(await appDataDir(), base)
        $slateBufferPath.value = unref(base)
        await join(unref($slateBufferPath), 'migrations')
        return unref($slateBufferPath)
    }



    return {
        setDbPath,
        setBufferPath,
        loadAndMigrateDb,
        db,
    }
}