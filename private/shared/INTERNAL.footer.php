                            </div>
                        </div>
                    </div>
                </div>
                <button id="returnTop" title="Return to Top of Page">Top</button>
            </div>
        </div>
        <footer id="footer">
            <!--Footer content populated here by script tag at end of body -->
        </footer>
        <script src="../../../js/libraries/jQuery-3.3.6.min.js"></script>
        <script defer>
            // When the document has loaded pull in the page header and footer skins
            $(document).ready(function () {
                // Change the v= to a different number to force clearing the cached version on the client browser
                $('#header').load('../../../templates/INTERNAL.header.php');
                $('#sidebar').load('../../../templates/INTERNAL.sidebar.php');
                $('#footer').load('../../../templates/INTERNAL.footer.php');
            })
        </script>
    </body>

</html>
<?php db_disconnect($db); ?>