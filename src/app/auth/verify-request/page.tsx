export default function VerifyRequestPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Überprüfe deine Emails
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Ein Anmeldelink wurde an deine Email-Adresse gesendet.
                    </p>
                </div>
                <div className="mt-4">
                    <p className="text-sm text-gray-500">
                        Klicke auf den Link in der Email, um dich anzumelden.
                        <br />
                        (Für lokale Entwicklung: Schaue in die Terminal-Konsole)
                    </p>
                </div>
            </div>
        </div>
    )
}
